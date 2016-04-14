var utils = require('./utils');
var colors = require('./colors');
var transpose_network = require('./network/transpose_network');
var get_available_filters = require('./params/get_available_filters');
var get_filter_default_state = require('./filters/get_filter_default_state');
var set_defaults = require('./config/set_defaults');
var check_sim_mat = require('./config/check_sim_mat');

module.exports = function make_config(args) {

  var defaults = set_defaults();

  // Mixin defaults with user-defined arguments.
  var config = utils.extend(defaults, args);

  if (config.ini_expand){
    config.expand_button = false;
  } else {
    config.expand_button = true;
  }

  // save network_data to config
  // extend does not properly pass network_data
  config.network_data = args.network_data;

  // replace undersores with space in row/col names
  config.network_data.row_nodes.forEach(function(d){
    d.name = d.name.replace(/_/g, ' ');
  });
  config.network_data.col_nodes.forEach(function(d){
    d.name = d.name.replace(/_/g, ' ');
  });

  config.network_data.row_nodes_names = _.pluck(config.network_data.row_nodes, 'name');
  config.network_data.col_nodes_names = _.pluck(config.network_data.col_nodes, 'name');

  config.sim_mat = check_sim_mat(config);

  var filters = get_available_filters(config.network_data.views);

  var default_states = {};
  _.each( _.keys(filters.possible_filters), function(inst_filter){
    var tmp_state = get_filter_default_state(filters.filter_data, inst_filter);

    default_states[inst_filter] = tmp_state;
  });

  // process view
  if (_.has(config.network_data,'views')){
    config.network_data.views.forEach(function(inst_view){

      _.each( _.keys(filters.possible_filters), function(inst_filter){
        if ( !_.has(inst_view, inst_filter) ){
          inst_view[inst_filter] = default_states[inst_filter];
        }
      });

      var inst_nodes = inst_view.nodes;

      // fix rows in views
      inst_nodes.row_nodes.forEach(function(d){
        d.name = d.name.replace(/_/g, ' ');
      });

      // fix cols in views
      inst_nodes.col_nodes.forEach(function(d){
        d.name = d.name.replace(/_/g, ' ');
      });

    });
  }

  var col_nodes = config.network_data.col_nodes;
  var row_nodes = config.network_data.row_nodes;

  // add names and instantaneous positions to links
  config.network_data.links.forEach(function(d){
    d.name = row_nodes[d.source].name + '_' + col_nodes[d.target].name;
    d.row_name = row_nodes[d.source].name;
    d.col_name = col_nodes[d.target].name;
  });


  // transpose network if necessary
  if (config.transpose) {
    config.network_data = transpose_network(args.network_data);
    var tmp_col_label = args.col_label;
    var tmp_row_label = args.row_label;
    args.row_label = tmp_col_label;
    args.col_label = tmp_row_label;
  }

  // super-row/col labels
  if (!utils.is_undefined(args.row_label) && !utils.is_undefined(args.col_label)) {
    config.super_labels = true;
    config.super = {};
    config.super.row = args.row_label;
    config.super.col = args.col_label;
  }

  // initialize cluster ordering - both rows and columns
  config.inst_order = {};
  if (!utils.is_undefined(args.order) && utils.is_supported_order(args.order)) {
    config.inst_order.row = args.order;
    config.inst_order.col = args.order;
  } else {
    config.inst_order.row = 'clust';
    config.inst_order.col = 'clust';
  }

  // set row or column order directly -- note that row/col are swapped
  // !! need to swap row/col orderings
  if (!utils.is_undefined(args.row_order) && utils.is_supported_order(args.row_order)) {
    // !! row and col orderings are swapped, need to fix
    config.inst_order.col = args.row_order;
  }

  if (!utils.is_undefined(args.col_order) && utils.is_supported_order(args.col_order)) {
    // !! row and col orderings are swapped, need to fix
    config.inst_order.row = args.col_order;
  }

  var row_has_group = utils.has(args.network_data.row_nodes[0], 'group');
  var col_has_group = utils.has(args.network_data.col_nodes[0], 'group');
  config.show_dendrogram = row_has_group || col_has_group;

  config.show_categories = {};
  config.all_cats = {};
  config.cat_colors = {};
  config.cat_names = {};

  var num_colors = 0;
  _.each(['row','col'], function(inst_rc){

    config.show_categories[inst_rc] = false;

    config.all_cats[inst_rc] = [];
    var tmp_keys = _.keys(args.network_data[inst_rc+'_nodes'][0]);

    _.each( tmp_keys, function(d){
      if (d.indexOf('cat-') >= 0){
        config.show_categories[inst_rc] = true;
        config.all_cats[inst_rc].push(d);
      }
    });


    var tmp_super;
    var tmp_cat;

    if (config.show_categories[inst_rc]){

      config.cat_colors[inst_rc] = {};
      config.cat_names[inst_rc] = {};

      _.each( config.all_cats[inst_rc], function(inst_cat){

        var super_string = ': '
        _.each(args.network_data[inst_rc+'_nodes'], function(inst_node){

          if (inst_node[inst_cat].indexOf(super_string) > 0){
            tmp_super = inst_node[inst_cat].split(super_string)[0];
            tmp_cat = inst_node[inst_cat].split(super_string)[1];
            config.cat_names[inst_rc][inst_cat] = tmp_super;
          } else {
            config.cat_names[inst_rc][inst_cat] = inst_cat;
          }

        });

        var names_of_cat = _.uniq(_.pluck(args.network_data[inst_rc+'_nodes'], inst_cat));

        config.cat_colors[inst_rc][inst_cat] = {};

        _.each(names_of_cat, function(cat_tmp, i){
          
          config.cat_colors[inst_rc][inst_cat][cat_tmp] = colors.get_random_color(i+2+num_colors);

          // hack to get 'Not' categories to not be dark colored
          if (cat_tmp.indexOf('Not ') >= 0){
            config.cat_colors[inst_rc][inst_cat][cat_tmp] = '#eee';
          }

          num_colors = num_colors + 1;
        });

      } );

    }

    if (config.sim_mat){
      config.cat_colors['row'] = config.cat_colors['col'];
    }

  });

  // check for category information
  if (config.show_categories.col) {
    // generate a dictionary of columns in each category
    config.cat_dict = {};
    col_nodes.forEach(function(d){

      // initialize array for each category
      if (!utils.has(config.cat_dict, d.cat)){
        config.cat_dict[d.cat] = [];
      }
      // add column name to category array
      config.cat_dict[d.cat].push(d.name);
    });

  }

  return config;
};
