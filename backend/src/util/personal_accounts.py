import os
from openpyxl import load_workbook
import logging
from dotenv import load_dotenv
from util.atomic_excel_operations import atomic_excel_operation  # Import our atomic operations

load_dotenv()

PERSONAL_ACCOUNT_ROOTPATH = os.getenv('PERSONAL_ACCOUNT_ROOTPATH')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def perform_personal_account_update(workbook, employee_name: str, employee_accountNo: str, institution_name: str, date: str, capital: float = None, interest: float = None):
    """
    Separated personal account update logic to work with atomic operations
    
    Args:
        workbook: The openpyxl workbook object to work with
        employee_name (str): Name of the employee
        employee_accountNo (str): Account number of the employee
        institution_name (str): Name of the institution
        date (str): Date of the payment
        capital (float, optional): Capital amount. Defaults to None.
        interest (float, optional): Interest amount. Defaults to None.
        
    Returns:
        int: The row number that was updated
    """
    
    ws = workbook.active  # Get the active sheet
    
    # Find 4 consecutive empty rows
    current_row = None
    empty_rows_count = 0
    first_empty_row = None
    
    for row in range(1, ws.max_row + 100):  # +100 to ensure we check enough rows
        # Check if current row is empty in columns A, H, and I
        date_cell = ws.cell(row=row, column=1)  # Column A
        interest_cell = ws.cell(row=row, column=8)  # Column H
        capital_cell = ws.cell(row=row, column=9)  # Column I
        
        is_row_empty = all(
            cell.value in (None, "") 
            for cell in [date_cell, interest_cell, capital_cell]
        )
        
        if is_row_empty:
            if empty_rows_count == 0:
                # Remember the first empty row of the sequence
                first_empty_row = row
            empty_rows_count += 1
            
            if empty_rows_count >= 4:
                current_row = first_empty_row
                break
        else:
            # Reset counter if we find a non-empty row
            empty_rows_count = 0
            first_empty_row = None
    
    if current_row is None:
        raise ValueError(f"Could not find 4 consecutive empty rows in personal account file for {employee_name}")
        
    # Update the cells
    # Date in Column A
    ws.cell(row=current_row, column=1).value = date
    
    # Interest in Column H (if provided)
    if interest is not None:
        ws.cell(row=current_row, column=8).value = interest
        
    # Capital in Column I (if provided)
    if capital is not None:
        ws.cell(row=current_row, column=9).value = capital
    
    # Updating column 2 with the word BS
    ws.cell(row=current_row, column=2).value = "BS"
    
    return current_row


def update_personal_account(employee_name: str, employee_accountNo: str, institution_name: str, date: str, capital: float = None, interest: float = None) -> dict:
    """
    Updates the personal account Excel file for a specific employee with payment information.
    Looks for 4 consecutive empty rows and uses the first one for the update.
    Now uses atomic operations to prevent file corruption.
    
    Args:
        employee_name (str): Name of the employee
        employee_accountNo (str): Account number of the employee
        institution_name (str): Name of the institution
        date (str): Date of the payment
        capital (float, optional): Capital amount. Defaults to None.
        interest (float, optional): Interest amount. Defaults to None.
        
    Returns:
        dict: A dictionary containing success status and additional information
    """

    try:
        # Construct the file path
        file_path = f"{PERSONAL_ACCOUNT_ROOTPATH}/{institution_name}/{employee_name}-{employee_accountNo}.xlsx"

        logger.info(f"The file path of the employee is {file_path}")
        
        # Check if file exists
        if not os.path.exists(file_path):
            return {
                "success": False,
                "error": f"Personal account file not found for {employee_name} in {institution_name} with account number {employee_accountNo}"
            }
        
        # Perform atomic Excel operation
        with atomic_excel_operation(file_path) as workbook:
            current_row = perform_personal_account_update(
                workbook, 
                employee_name, 
                employee_accountNo, 
                institution_name, 
                date, 
                capital, 
                interest
            )
        
        success_message = f"Successfully updated personal account for {employee_name} at row {current_row}"
        logger.info(success_message)
        
        return {
            "success": True,
            "message": success_message,
            "row_updated": current_row
        }
        
    except ValueError as ve:
        # Handle specific ValueError (like not finding empty rows)
        error_message = str(ve)
        logger.error(f"Validation error updating personal account for {employee_name}: {error_message}")
        return {
            "success": False,
            "error": error_message
        }
        
    except FileNotFoundError as fe:
        # Handle file not found errors
        error_message = f"File not found: {str(fe)}"
        logger.error(f"File error updating personal account for {employee_name}: {error_message}")
        return {
            "success": False,
            "error": error_message
        }
        
    except Exception as e:
        # Handle any other unexpected errors
        error_message = f"Error updating personal account for {employee_name}: {str(e)}"
        logger.error(error_message)
        import traceback
        logger.error(traceback.format_exc())
        return {
            "success": False,
            "error": error_message
        }