import time
# import StringIO

start_time = time.time()

# import network class from Network.py
from clustergrammer import Network

net = Network()

# net.pandas_load_file('txt/example_tsv.txt')
net.pandas_load_file('txt/col_categories.txt')
# net.pandas_load_file('txt/mat_1mb.txt')
# net.pandas_load_file('txt/mnist.txt')

print('\n\nchecking for full names before make_filtered_views')
print('--------------------\n--------------------')
print(net.dat['node_info']['col'].keys())

net.make_filtered_views(dist_type='cos',views=['N_row_sum','N_row_var'], dendro=True)

net.write_json_to_file('viz', 'json/mult_view.json', 'indent')

# your code
elapsed_time = time.time() - start_time

print('\n\n\nelapsed time')
print(elapsed_time)