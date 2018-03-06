#!/usr/bin/python

#-----------------------------------------------------------------------
# 01/11/2018
#
# This is a flask site for working with delivered samples 
# newly created extensions
#-----------------------------------------------------------------------
import os
import sys
import datetime
import requests
import amazon_search
import writeback
from lxml import etree
from bs4 import BeautifulSoup
from datetime import date
from datetime import timedelta
from collections import OrderedDict
from flask import Flask, render_template, json, jsonify, request, redirect, url_for, abort, session, app
from flask_restful import reqparse

# Define a Flask app
app = Flask(__name__)

# Set a default timeout for the session variables
app.permanent_session_lifetime = timedelta(seconds=600)

@app.route('/')
def home():
    
    # Define variables
    trex_folder = os.path.join(app.static_folder, 'trex_files')
    full_trex_file_path = ''
    all_extensions = []
    my_extensions = []
    
    # Loop through all of our trex files
    for file in os.listdir(trex_folder):
        
        # Define variables
        extension_description  = ''
        extension_path = ''
        
        # Set the full trex path 
        full_trex_file_path = os.path.join(trex_folder, file)
        
        # Read in the trex files
        handler = open(full_trex_file_path).read()
        
        # Use BeautifulSoup to parse the XML
        soup = BeautifulSoup(handler, 'lxml')
        
        # Get the description for the extensions 
        for description in soup.findAll('description'):
            extension_description = description.text
        
        # Get the URL for the extensions 
        for url in soup.findAll('url'):
            extension_path = url.text
            
        # Append to the array of exentensions
        all_extensions.append({"extension_description":extension_description, "extension_path":extension_path})
            
    return render_template('/views/index.html', extension_details = json.dumps(all_extensions))

@app.route('/datasources', methods=['GET','POST'])
def datasources():
    return render_template('/views/datasources.html')

@app.route('/filtering', methods=['GET','POST'])
def filtering():
    return render_template('/views/filtering.html')

@app.route('/amazon_product_search', methods=['GET','POST'])
def amazon_product_search():
    
    # Print the current status to the console
    print ('Amazon Product Search Started...')
    
    # Define variables
    return_message = ''
    return_status = 'Success'
    all_products = []
    
    # See if this is a GET or POST
    if request.method == 'POST':
        
        # Capture the json which has our product we are searching on 
        search_criteria = request.json
        
        # Print the current status to the console
        print ("Searching Amazon for " + search_criteria['curr_product'])
      
        # Attempt to Make a call to the amazon product search api 
        try:
            
            # Pass in the product we are searching on and the path to the static folder which holds the config for the API
            all_products = amazon_search.search_amazon_products(app.static_folder, search_criteria['curr_product'])
            
            # Define the return message
            return_message = 'We found the following products on Amazon which match the provided criteria.'
            return_status = "Success"
            
        except Exception, ex:
            
            # Display an error to the console
            print (ex)
            
            # Handle AWS error messages
            if "AWS.ECommerceService.NoExactMatches" in str(ex):
            
                # Define the return message
                return_message = "Amazon could not find any product matches based on the search criteria provided!"
                return_status = "Warning"
                
            elif "InvalidClientTokenId" in str(ex) or "SignatureDoesNotMatch" in str(ex) :
                
                return_message = "The Amazon Product API credentials you provided do not check out.  Please validate your credentials and try again."
                return_status = "Error"
                
            else:
                
                # Define the return message
                return_message = 'There is an issue with connecting to the Amazon Product Advertising API'
                return_status = "Error"
                
            # Display an error to the console
            print (return_message)

        # Return the status of the operation
        return jsonify(return_message, return_status, all_products)

    else:
        
        # Render the html page for the product search as this action is a GET
        return render_template('/views/amazon_product_search.html')

@app.route('/writeback_to_db', methods=['GET','POST'])
def writeback_to_db():
    
    # Print the current status to the console
    print ('Database Writeback Started...')
    
    # Define variables
    return_message = ''
    return_status = 'Success'
    
    # See if this is a GET or POST
    if request.method == 'POST':
        
        # Capture the json which has the data we will write to the database 
        writeback_data = request.json
        
        # Get the data on the single product we will save to the database
        all_product_info = amazon_search.search_amazon_products(app.static_folder, writeback_data['curr_product'])
        
        # Call the function that will handle the writeback to the database
        writeback.save_product_to_database(all_product_info, writeback_data['product_quantity'])
        
        # Send a message back to the user regarding the status of the writeback
        return jsonify(return_message, return_status)
        
@app.errorhandler(403)
def page_not_found(e):
    return render_template('/views/403.html'), 403

@app.errorhandler(404)
def page_not_found(e):
    return render_template('/views/404.html'), 404

@app.errorhandler(500)
def page_not_found(e):
    return render_template('/views/500.html'), 500
    
# Check if the executed file is the main program and run the app
if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5013)
    
