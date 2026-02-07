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
    
    Searches for files that match employee_name.xlsx or employee_name.xls
    This covers formats like:
    - K.G.R.S.K.GUNATHILAKA.xlsx (exact match)
    - K.G.R.S.K.GUNATHILAKA.xls (Excel 97-2003 format)
    
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
    
    # Search for files that match employee_name.xlsx or employee_name.xls
    matching_files = []
    
    for file in os.listdir(directory_path):
        if (file.startswith(employee_name) and 
            (file.endswith('.xlsx') or file.endswith('.xls'))):
            matching_files.append(os.path.join(directory_path, file))
            logger.info(f"Found matching file: {file}")
    
    if not matching_files:
        raise FileNotFoundError(f"Personal account file not found or file closed for {employee_name} in {institution_name} with account number {employee_accountNo}.")
    
    # If multiple matches found, prioritize .xlsx over .xls, then use first match
    if len(matching_files) > 1:
        # Sort to prioritize .xlsx files
        matching_files.sort(key=lambda x: (not x.endswith('.xlsx'), x))
        logger.warning(f"Multiple files found for {employee_name}-{employee_accountNo}: {[os.path.basename(f) for f in matching_files]}")
        logger.warning(f"Using the first match (prioritizing .xlsx): {os.path.basename(matching_files[0])}")
    
    logger.info(f"Found personal account file: {os.path.basename(matching_files[0])}")
    return matching_files[0]




def find_employee_sheet(workbook, employee_accountNo: str):
    """
    Find the correct sheet for an employee by matching account number in cell J2.
    Searches from last sheet to first sheet.
    
    Args:
        workbook: The openpyxl workbook object
        employee_accountNo (str): Account number to match
        
    Returns:
        worksheet: The matching worksheet object
        
    Raises:
        ValueError: If no matching sheet is found
    """
    # Get all worksheets and reverse the order (last to first)
    worksheets = workbook.worksheets
    
    for ws in reversed(worksheets):
        try:
            # Get value from cell J2
            j2_value = ws.cell(row=2, column=10).value  # Column J is 10
            
            if j2_value and isinstance(j2_value, str):
                # Split by '/' and check if we have at least 3 parts
                parts = j2_value.split('/')
                if len(parts) >= 3:
                    # Extract the string between 2nd and 3rd slash (index 2)
                    account_part = parts[2]
                    if account_part == employee_accountNo:
                        logger.info(f"Found matching sheet: {ws.title} with account number {employee_accountNo}")
                        return ws
        except Exception as e:
            # Log warning but continue searching other sheets
            logger.warning(f"Error reading cell J2 from sheet {ws.title}: {e}")
            continue
    
    # If no matching sheet found
    raise ValueError(f"No sheet found with account number {employee_accountNo} in cell J2")





def find_employee_sheet_xls(rb, employee_accountNo: str):
    """
    Find the correct sheet for an employee by matching account number in cell J2 for .xls files.
    Searches from last sheet to first sheet.
    
    Args:
        rb: The xlrd workbook object
        employee_accountNo (str): Account number to match
        
    Returns:
        tuple: (sheet_index, sheet_object) of the matching sheet
        
    Raises:
        ValueError: If no matching sheet is found
    """
    # Get all sheets and search from last to first
    for sheet_index in range(rb.nsheets - 1, -1, -1):
        try:
            sheet = rb.sheet_by_index(sheet_index)
            
            # Check if sheet has at least 2 rows and 10 columns (J is column 9, 0-indexed)
            if sheet.nrows >= 2 and sheet.ncols >= 10:
                # Get value from cell J2 (row 1, column 9 in 0-indexed)
                j2_value = sheet.cell_value(1, 9)
                
                if j2_value and isinstance(j2_value, str):
                    # Split by '/' and check if we have at least 3 parts
                    parts = j2_value.split('/')
                    if len(parts) >= 3:
                        # Extract the string between 2nd and 3rd slash (index 2)
                        account_part = parts[2]
                        if account_part == employee_accountNo:
                            logger.info(f"Found matching sheet: {sheet.name} (index {sheet_index}) with account number {employee_accountNo}")
                            return sheet_index, sheet
        except Exception as e:
            # Log warning but continue searching other sheets
            logger.warning(f"Error reading cell J2 from sheet index {sheet_index}: {e}")
            continue
    
    # If no matching sheet found
    raise ValueError(f"No sheet found with account number {employee_accountNo} in cell J2")

