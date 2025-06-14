# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from mongo.mongo_connector import get_db

app = Flask(__name__)
CORS(app, resources={r"/*": {
    "origins": "*", 
    "methods": ["GET", "POST", "DELETE", "OPTIONS"],  # Added DELETE 
    "allow_headers": ["Content-Type", "Authorization"]
}})


@app.route('/getInstitutions', methods=['GET'])
def get_institutions():
    try:
        db = get_db()
        institutions_collection = db["institutions"]
        
        # Get all institutions (without the MongoDB _id field)
        institutions = []
        for institution in institutions_collection.find({}, {"_id": 0}):
            institutions.append(institution)
            
        return jsonify({"institutions": institutions}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    

@app.route('/addInstitution', methods=['POST'])
def add_institution():
    try:
        data = request.json
        institution_name = data.get("institution_name")

        if not institution_name:
            return jsonify({"error": "Institution name is required"}), 400

        db = get_db()
        institutions_collection = db["institutions"]

        # Create the new institution document
        institution = {
            "institution_name": institution_name,
            "employees": []  # Initially no employees
        }

        # Insert the institution into the database
        institutions_collection.insert_one(institution)

        return jsonify({"message": "Institution added successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/deleteInstitution', methods=['DELETE'])
def delete_institution():
    try:
        data = request.json
        institution_name = data.get("institution_name")
        
        if not institution_name:
            return jsonify({"error": "Institution name is required"}), 400
            
        db = get_db()
        institutions_collection = db["institutions"]
        
        # Delete the institution
        result = institutions_collection.delete_one({"institution_name": institution_name})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Institution not found"}), 404
            
        return jsonify({"message": "Institution deleted successfully!"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    



@app.route('/editInstitution', methods=['PUT'])
def edit_institution():
    try:
        data = request.json
        old_institution_name = data.get("old_institution_name")
        new_institution_name = data.get("new_institution_name")
        
        if not old_institution_name or not new_institution_name:
            return jsonify({"error": "Both old and new institution names are required"}), 400
            
        db = get_db()
        institutions_collection = db["institutions"]
        
        # Check if the old institution exists
        institution = institutions_collection.find_one({"institution_name": old_institution_name})
        
        if not institution:
            return jsonify({"error": "Institution not found"}), 404
            
        # Check if the new institution name already exists (to avoid duplicates)
        existing_institution = institutions_collection.find_one({"institution_name": new_institution_name})
        
        if existing_institution and existing_institution["institution_name"] != old_institution_name:
            return jsonify({"error": "Institution with the new name already exists"}), 409
            
        # Update the institution name
        result = institutions_collection.update_one(
            {"institution_name": old_institution_name},
            {"$set": {"institution_name": new_institution_name}}
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Failed to update institution name"}), 500
            
        return jsonify({"message": "Institution name updated successfully!"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    





@app.route('/addEmployees', methods=['POST'])
def add_employees():
    try:
        data = request.json
        institution_name = data.get("institution_name")
        employee_map = data.get("employees")  # Expecting a dict of { "NIC": {"name": "Name", "accountNo": "ACC123", "capital": value, "interest": value} }

        if not institution_name or not employee_map:
            return jsonify({"error": "Institution name and employee map is required"}), 400

        db = get_db()
        institutions_collection = db["institutions"]

        # Find the institution in the database
        institution = institutions_collection.find_one({"institution_name": institution_name})

        if not institution:
            return jsonify({"error": "Institution not found"}), 404

        # Add the employees to the institution using provided NIC as ID
        for nic, employee_data in employee_map.items():
            institution["employees"].append({
                "id": nic,
                "name": employee_data.get("name"),
                "accountNo": employee_data.get("accountNo"),
                "capital": employee_data.get("capital"),
                "interest": employee_data.get("interest")
            })

        # Update the institution with new employees
        institutions_collection.update_one(
            {"institution_name": institution_name},
            {"$set": {"employees": institution["employees"]}}
        )

        return jsonify({"message": "Employees added successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500




@app.route('/deleteEmployee', methods=['DELETE'])
def delete_employee():
    try:
        data = request.json
        institution_name = data.get("institution_name")
        employee_id = data.get("employee_id")
        
        if not institution_name or not employee_id:
            return jsonify({"error": "Institution name and employee ID are required"}), 400
            
        db = get_db()
        institutions_collection = db["institutions"]
        
        # Find the institution
        institution = institutions_collection.find_one({"institution_name": institution_name})
        
        if not institution:
            return jsonify({"error": "Institution not found"}), 404
            
        # Remove the employee from the list
        employees = institution["employees"]
        initial_count = len(employees)
        employees = [emp for emp in employees if emp["id"] != employee_id]
        
        if len(employees) == initial_count:
            return jsonify({"error": "Employee not found"}), 404
            
        # Update the institution with the modified employees list
        institutions_collection.update_one(
            {"institution_name": institution_name},
            {"$set": {"employees": employees}}
        )
        
        return jsonify({"message": "Employee deleted successfully!"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


@app.route('/editEmployee', methods=['PUT'])
def edit_employee():
    try:
        data = request.json
        institution_name = data.get("institution_name")
        employee_id = data.get("employee_id")
        updated_employee_data = data.get("employee_data")
        
        if not institution_name or not employee_id or not updated_employee_data:
            return jsonify({"error": "Institution name, employee ID, and employee data are required"}), 400
            
        db = get_db()
        institutions_collection = db["institutions"]
        
        # Find the institution
        institution = institutions_collection.find_one({"institution_name": institution_name})
        
        if not institution:
            return jsonify({"error": "Institution not found"}), 404
            
        # Find and update the employee in the employees list
        employees = institution["employees"]
        employee_found = False
        
        for i, employee in enumerate(employees):
            if employee["id"] == employee_id:
                # Update employee data while preserving the ID
                employees[i] = {
                    "id": employee_id,  # Keep the original ID
                    "name": updated_employee_data.get("name", employee.get("name")),
                    "accountNo": updated_employee_data.get("accountNo", employee.get("accountNo")),
                    "capital": updated_employee_data.get("capital", employee.get("capital")),
                    "interest": updated_employee_data.get("interest", employee.get("interest"))
                }
                employee_found = True
                break
                
        if not employee_found:
            return jsonify({"error": "Employee not found"}), 404
            
        # Update the institution with the modified employees list
        result = institutions_collection.update_one(
            {"institution_name": institution_name},
            {"$set": {"employees": employees}}
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Failed to update employee data"}), 500
            
        return jsonify({"message": "Employee data updated successfully!"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500