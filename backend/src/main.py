# main.py

from flask import Flask
from flask_cors import CORS
from database_controllers.database_controller import add_institution, add_employees, delete_institution ,delete_employee, get_institutions, edit_institution, edit_employee
from excel_controllers.excel_controller import update_cell, submit_payment, submit_batch_payment

app = Flask(__name__)
CORS(app, resources={r"/*": {
    "origins": "*", 
    "methods": ["GET", "POST", "DELETE", "OPTIONS", "PUT"],  # Added DELETE here
    "allow_headers": ["Content-Type", "Authorization"]
}})

# Register routes
app.add_url_rule('/addInstitution', view_func=add_institution, methods=['POST'])
app.add_url_rule('/addEmployees', view_func=add_employees, methods=['POST'])
app.add_url_rule('/getInstitutions', view_func=get_institutions, methods=['GET'])
app.add_url_rule('/deleteInstitution', view_func=delete_institution, methods=['DELETE'])
app.add_url_rule('/deleteEmployee', view_func=delete_employee, methods=['DELETE'])
app.add_url_rule('/editInstitution', view_func=edit_institution, methods=['PUT'])
app.add_url_rule('/editEmployee', view_func=edit_employee, methods=['PUT'])

app.add_url_rule('/update-cell', view_func=update_cell, methods=['POST'])
app.add_url_rule('/submitPayment', view_func=submit_payment, methods=['POST'])
app.add_url_rule('/submitExcelBatchPayment', view_func=submit_batch_payment, methods=['POST'])

if __name__ == '__main__':
    app.run(debug=True)
