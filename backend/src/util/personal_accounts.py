import os
from openpyxl import load_workbook
import xlrd
import xlwt
from xlutils.copy import copy
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


def find_personal_account_file(employee_name: str, employee_accountNo: str, institution_name: str) -> str:
    """
    Find the personal account file for an employee using a single flexible search logic.
    
    Searches for files that start with employee_name and end with -employee_accountNo.xlsx or -employee_accountNo.xls
    This covers formats like:
    - K.G.R.S.K.GUNATHILAKA-529.xlsx (exact match)
    - K.G.R.S.K.GUNATHILAKA(ABC)-529.xlsx (with parenthetical content)
    - K.G.R.S.K.GUNATHILAKA-529.xls (Excel 97-2003 format)
    - K.G.R.S.K.GUNATHILAKA(ABC)-529.xls (Excel 97-2003 with parenthetical content)
    
    Args:
        employee_name (str): Name of the employee
        employee_accountNo (str): Account number of the employee
        institution_name (str): Name of the institution
        
    Returns:
        str: Full path to the found file
        
    Raises:
        FileNotFoundError: If no matching file is found
    """
    directory_path = f"{PERSONAL_ACCOUNT_ROOTPATH}/{institution_name}"
    
    # Check if directory exists
    if not os.path.exists(directory_path):
        raise FileNotFoundError(f"Directory not found: {directory_path}")
    
    # Search for files that start with employee name and end with -account_number.xlsx or .xls
    matching_files = []
    expected_suffixes = [f"-{employee_accountNo}.xlsx", f"-{employee_accountNo}.xls"]
    
    for file in os.listdir(directory_path):
        if file.startswith(employee_name):
            # Check if file ends with any of the expected suffixes
            for suffix in expected_suffixes:
                if file.endswith(suffix):
                    matching_files.append(os.path.join(directory_path, file))
                    logger.info(f"Found matching file: {file}")
                    break
    
    if not matching_files:
        raise FileNotFoundError(f"Personal account file not found for {employee_name} in {institution_name} with account number {employee_accountNo}. Looking for files ending with {expected_suffixes}")
    
    # If multiple matches found, prioritize .xlsx over .xls, then use first match
    if len(matching_files) > 1:
        # Sort to prioritize .xlsx files
        matching_files.sort(key=lambda x: (not x.endswith('.xlsx'), x))
        logger.warning(f"Multiple files found for {employee_name}-{employee_accountNo}: {[os.path.basename(f) for f in matching_files]}")
        logger.warning(f"Using the first match (prioritizing .xlsx): {os.path.basename(matching_files[0])}")
    
    logger.info(f"Found personal account file: {os.path.basename(matching_files[0])}")
    return matching_files[0]


def perform_personal_account_update_xls(file_path: str, employee_name: str, date: str, capital: float = None, interest: float = None):
    """
    Handle .xls files using xlrd/xlwt
    
    Args:
        file_path (str): Full path to the .xls file
        employee_name (str): Name of the employee
        date (str): Date of the payment
        capital (float, optional): Capital amount. Defaults to None.
        interest (float, optional): Interest amount. Defaults to None.
        
    Returns:
        int: The row number that was updated
    """
    
    # Read the existing file
    rb = xlrd.open_workbook(file_path, formatting_info=True)
    sheet = rb.sheet_by_index(0)
    
    # Find 4 consecutive empty rows
    current_row = None
    empty_rows_count = 0
    first_empty_row = None
    
    max_rows = max(sheet.nrows + 100, 1000)  # Ensure we check enough rows
    
    for row in range(max_rows):
        # Check if current row is empty in columns A (0), H (7), and I (8)
        date_value = ""
        interest_value = ""
        capital_value = ""
        
        if row < sheet.nrows:
            if sheet.ncols > 0:
                date_value = sheet.cell_value(row, 0)
            if sheet.ncols > 7:
                interest_value = sheet.cell_value(row, 7)
            if sheet.ncols > 8:
                capital_value = sheet.cell_value(row, 8)
        
        is_row_empty = all(
            str(value).strip() == "" 
            for value in [date_value, interest_value, capital_value]
        )
        
        if is_row_empty:
            if empty_rows_count == 0:
                first_empty_row = row
            empty_rows_count += 1
            
            if empty_rows_count >= 4:
                current_row = first_empty_row
                break
        else:
            empty_rows_count = 0
            first_empty_row = None
    
    if current_row is None:
        raise ValueError(f"Could not find 4 consecutive empty rows in personal account file for {employee_name}")
    
    # Create a copy of the workbook for writing
    wb = copy(rb)
    ws = wb.get_sheet(0)
    
    # Update the cells
    ws.write(current_row, 0, date)  # Date in Column A (0)
    ws.write(current_row, 1, "BS")  # BS in Column B (1)
    
    if interest is not None:
        ws.write(current_row, 7, interest)  # Interest in Column H (7)
        
    if capital is not None:
        ws.write(current_row, 8, capital)  # Capital in Column I (8)
    
    # Save the file
    wb.save(file_path)
    
    return current_row


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
    Uses atomic operations to prevent file corruption and flexible file matching.
    
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
        # Find the file (supports both .xls and .xlsx)
        file_path = find_personal_account_file(employee_name, employee_accountNo, institution_name)
        
        logger.info(f"The file path of the employee is {file_path}")
        
        # Determine file type and use appropriate handler
        if file_path.lower().endswith('.xlsx'):
            logger.info("Processing .xlsx file with openpyxl")
            # Use existing atomic operations for .xlsx files
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
        elif file_path.lower().endswith('.xls'):
            logger.info("Processing .xls file with xlrd/xlwt")
            current_row = perform_personal_account_update_xls(
                file_path, 
                employee_name, 
                date, 
                capital, 
                interest
            )
        else:
            raise ValueError(f"Unsupported file format: {file_path}")
        
        success_message = f"Successfully updated personal account for {employee_name} at row {current_row}"
        logger.info(success_message)
        
        return {
            "success": True,
            "message": success_message,
            "row_updated": current_row,
            "file_path": file_path
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