# My Tableau Extensions 

This is repository is a Python [Flask](http://flask.pocoo.org/) project which leverages the [Tableau Extensions API](https://tableau.github.io/extensions-api/).

The project contains two of the sample extensions delivered by Tableau (DataSources and Filtering).

The third extension is an extension of my own creation and it is an Amazon Product Search.  

## Amazon Product Search Extension

The idea for an Amazon Product Search extension came from talking with a person who worked in the Procurement Department of their organization.  They wanted the ability to look at the products they typically procured and compare them with what Amazon is currently selling the same product for.  To do this they had planned to use the Amazon [Product Advertising API](https://docs.aws.amazon.com/AWSECommerceService/latest/DG/ItemSearch.html) in an external application to achieve this goal.  With the advent of Tableau Extensions the user can now simply look up the current products directly from within a Tableau Dashboard.   

![Image of Amazon Product Search Extension](https://raw.githubusercontent.com/hutchijo/my_tableau_extensions/master/static/images/readme1.png)

This extension has **two** elements of integration:  

* The **first element of integration** allows you to click on a selected mark and the selection will be added to the search input.  This is taking a selected mark out of Tableau and passing it over to the extension code which is external to Tableau.  

* The **second element of integration** allows you to refresh the Tableau worksheet with the products after a purchase.  In this step when a user selects **"Buy Now"** there is write-back logic which inserts the purchase into a MySQL database table.  When the write-back has been completed the extension code triggers a refresh of the underlying data source for the Worksheet. 

In the following screenshot you can see both integrations in action. Notice how the product selections populate the Product Search input and then when we click "Buy Now" you can see the number of WorkForce printers goes from 13 to 18 after the purchase is completed.

![Image of Amazon Product Search Extension Animated](https://raw.githubusercontent.com/hutchijo/my_tableau_extensions/master/static/images/readme2.gif)

## Setup Required to use the Amazon Product Search Extension 

### Install Python 

You will need [Python 2.6](https://www.python.org/downloads/) or newer to get started, so be sure to have an up-to-date Python 2.x installation.  

### Install pip

pip is already installed if you're using Python 2 >=2.7.9 or Python 3 >=3.4 binaries downloaded from python.org, but you'll need to upgrade pip.  To install pip follow the instructions here - https://pip.pypa.io/en/stable/installing/ 

### Install Flask 
    
With Python installed see the instructions on the [Flask](http://flask.pocoo.org/) site for install or simply run:
    ```
    $ pip install Flask
    ```
### Install the [Python Wrapper](https://pypi.python.org/pypi/python-amazon-product-api/) for the [Amazon Product Advertising API](https://docs.aws.amazon.com/AWSECommerceService/latest/DG/ItemSearch.html).  

    ```
    $ pip install python-amazon-product-api
    ```
Note you will need to sign up as a Amazon Associate to use the API (it is free).  Once you have your credentials for the Amazon Product Advertising API you need to modify the amazon_config_file to have your specific credentials.  This files is located in the *static\config* folder.

   ```
    [Credentials]
    access_key = <your_access_key_here>
    secret_key = <your_secret_key_here>
    associate_tag = <your_associate_tag_here>
   ```

### Install Peewee

[Peewee](http://docs.peewee-orm.com/en/latest/peewee/installation.html) is a simple and small ORM written in Python built-in support for SQLite, MySQL and Postgresql.  We need this library for the write-back to our MySQL database.  If you want to use a different database then those listed above you will need to find a different ORM.

    ```
    $ pip install peewee
    ```

### Create a target database table

If you are using MySQL as your backend to this extension I have included a db_table_creation.sql script which will create the underlying table which saves the write-backs from the dashboard.  Run this script in your favorite MySQL client to create the table.  The script is located in the *"sql"* folder
