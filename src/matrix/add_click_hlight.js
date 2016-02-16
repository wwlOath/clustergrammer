var Params = require('../params');

module.exports = function(clicked_rect){
  var params = Params.get();

  // get x position of rectangle
  d3.select(clicked_rect).each(function(d){
    var pos_x = d.pos_x;
    var pos_y = d.pos_y;

    d3.selectAll('.click_hlight')
      .remove();

    if (pos_x!=params.matrix.click_hlight_x || pos_y!=params.matrix.click_hlight_y){

      // save pos_x to params.viz.click_hlight_x
      params.matrix.click_hlight_x = pos_x;
      params.matrix.click_hlight_y = pos_y;

      // draw the highlighting rectangle as four rectangles
      // so that the width and height can be controlled
      // separately

      var rel_width_hlight = 6;
      var opacity_hlight = 0.85;

      var hlight_width  = rel_width_hlight*params.viz.border_width;
      var hlight_height = rel_width_hlight*params.viz.border_width/params.viz.zoom_switch;

      // top highlight
      d3.select(clicked_rect.parentNode)
        .append('rect')
        .classed('click_hlight',true)
        .classed('top_hlight',true)
        .attr('width', params.matrix.x_scale.rangeBand())
        .attr('height', hlight_height)
        .attr('fill',params.matrix.hlight_color)
        .attr('transform', function() {
          return 'translate(' + params.matrix.x_scale(pos_x) + ',0)';
        })
        .attr('opacity',opacity_hlight);

      // left highlight
      d3.select(clicked_rect.parentNode)
        .append('rect')
        .classed('click_hlight',true)
        .classed('left_hlight',true)
        .attr('width', hlight_width)
        .attr('height', params.matrix.y_scale.rangeBand() - hlight_height*0.99 )
        .attr('fill',params.matrix.hlight_color)
        .attr('transform', function() {
          return 'translate(' + params.matrix.x_scale(pos_x) + ','+
            hlight_height*0.99+')';
        })
        .attr('opacity',opacity_hlight);

      // right highlight
      d3.select(clicked_rect.parentNode)
        .append('rect')
        .classed('click_hlight',true)
        .classed('right_hlight',true)
        .attr('width', hlight_width)
        .attr('height', params.matrix.y_scale.rangeBand() - hlight_height*0.99 )
        .attr('fill',params.matrix.hlight_color)
        .attr('transform', function() {
          var tmp_translate = params.matrix.x_scale(pos_x) + params.matrix.x_scale.rangeBand() - hlight_width;
          return 'translate(' + tmp_translate + ','+
            hlight_height*0.99+')';
        })
        .attr('opacity',opacity_hlight);

      // bottom highlight
      d3.select(clicked_rect.parentNode)
        .append('rect')
        .classed('click_hlight',true)
        .classed('bottom_hlight',true)
        .attr('width', function(){
          return params.matrix.x_scale.rangeBand() - 1.98*hlight_width;})
        .attr('height', hlight_height)
        .attr('fill',params.matrix.hlight_color)
        .attr('transform', function() {
          var tmp_translate_x = params.matrix.x_scale(pos_x) + hlight_width*0.99;
          var tmp_translate_y = params.matrix.y_scale.rangeBand() - hlight_height;
          return 'translate(' + tmp_translate_x + ','+
            tmp_translate_y+')';
        })
        .attr('opacity',opacity_hlight);

      } else {
        params.matrix.click_hlight_x = -666;
        params.matrix.click_hlight_y = -666;
      }


  });
};
