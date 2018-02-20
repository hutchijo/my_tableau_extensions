import os
import sys
import datetime
import amazonproduct
from lxml import etree
from flask import json, jsonify

#--------------------------------------------------------------------------------------------
# 02/09/2018
#
# This library contains all of the helper functions used to
# communicate with the Amazon Product Advertising API
#
# To read more about the python library that allows us to connect to
# the api please see this site - 
# http://python-amazon-product-api.readthedocs.io/en/latest/index.html
#
# To work with the Amazon Product Advertising API you must register with
# Amazon as an associate here - https://affiliate-program.amazon.com/
# Amazon will provide the necessary credentials for the amazon_config_file 
# referenced below.
#
#--------------------------------------------------------------------------------------------
    
# This is a simple function which performs the product search based on the criteria passed in
def search_amazon_products(static_folder, search_keywords):
    
    # Define constants 
    NUMBER_OF_ROWS_TO_RETURN = 10
    
    # Define variables
    all_products = []
    counter = 0
    
    # Create the path for the config file which stores credentials to the Amazon API 
    amazon_config_path = os.path.join(static_folder, 'config/amazon_config_file')
    
    # Instantiate the Amazon Product Advertising API
    api = amazonproduct.API(cfg=amazon_config_path)
    
    # Perform the search and get back the items from Amazon 
    products = api.item_search('All', Keywords = search_keywords, ResponseGroup='ItemAttributes, Images')
    
    # Loop through the products
    for curr_product in products: 
        
        # Define variables
        product_asin = product_mpn = product_title = product_manufacturer = product_brand = product_package_quantity = product_color = product_size = product_price = product_group = product_image = product_description = ''
   
        # Attempt to get all the details for the product
        try:
        
            # Get the product ASIN
            product_asin = str(curr_product.ASIN)

             # Print the status to the console - USED FOR DEBUGGING
             # print 'Product ASIN:' + product_asin

            # Get the remaining product attributes
            if hasattr(curr_product.ItemAttributes, 'Title'):
                product_title = repr(curr_product.ItemAttributes.Title)   
            if hasattr(curr_product.ItemAttributes, 'Manufacturer'):
                product_manufacturer = str(curr_product.ItemAttributes.Manufacturer)    
            if hasattr(curr_product.ItemAttributes, 'Brand'):
                product_brand = str(curr_product.ItemAttributes.Brand)
            if hasattr(curr_product.ItemAttributes, 'MPN'):
                product_mpn = str(curr_product.ItemAttributes.MPN)    
            if hasattr(curr_product.ItemAttributes, 'PackageQuantity'):          
                product_package_quantity =  str(curr_product.ItemAttributes.PackageQuantity)
            if hasattr(curr_product.ItemAttributes, 'Color'):     
                product_color =  str(curr_product.ItemAttributes.Color)
            if hasattr(curr_product.ItemAttributes, 'Size'):          
                product_size =  str(curr_product.ItemAttributes.Size) 
            if hasattr(curr_product.ItemAttributes, 'ListPrice'): 
                product_price = str(unicode(curr_product.ItemAttributes.ListPrice.FormattedPrice)).replace('$', '').strip()
            if hasattr(curr_product.ItemAttributes, 'ProductGroup'):         
                product_group = str(curr_product.ItemAttributes.ProductGroup)  
            if hasattr(curr_product.ImageSets.ImageSet, 'MediumImage'):         
                product_image = repr(unicode(curr_product.ImageSets.ImageSet.MediumImage.URL)).strip()
            if hasattr(curr_product.ItemAttributes, 'Feature'):         
                for feature in curr_product.ItemAttributes.Feature:
                    product_description = product_description + ' ' + repr(feature)
            product_description = product_description.strip()                          
            
            # Only return products with a price
            if (product_price != ''):
                
                # Only return the first 10 products as this is just a demo
                if (counter < NUMBER_OF_ROWS_TO_RETURN):

                    # Append to the current product attributes to the All Products Array
                    all_products.append({'product_asin': product_asin, 'product_mpn': product_mpn, 'product_title': product_title, 'product_manufacturer': product_manufacturer, 'product_brand': product_brand, 'product_package_quantity': product_package_quantity, 'product_color': product_color, 'product_size': product_size, 'product_price': product_price, 'product_group': product_group, 'product_image': product_image, 'product_description': product_description})

                    # Increment the counter
                    counter = counter + 1
            
        except Exception, ex:
            
            # Print the error message 
            print  '    Skipping this product - ' + str(ex)
            
    # Return all of the products found
    return all_products