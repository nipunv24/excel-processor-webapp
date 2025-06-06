# 💰 Loan Management System

*Streamlining loan interest and capital payment tracking for financial institutions*

---

## 🌟 Overview

**Loan Management System** is a comprehensive web application designed specifically for loan lending companies to automate and simplify the process of recording loan interest and capital payments. Say goodbye to manual Excel entries and hello to efficient, error-free financial data management!

### ✨ Key Features

- 🏦 **Multi-Institution Support** - Manage clients across multiple financial institutions
- 👥 **Employee Management** - Store and organize employee information with MongoDB
- 💳 **Individual Payments** - Record single interest/capital payments with ease
- 📦 **Batch Processing** - Handle bulk payments for entire groups efficiently
- 🔒 **Atomic Operations** - File corruption protection with automatic backups
- 📊 **Excel Integration** - Seamless Excel file updates with data integrity
- 🎯 **User-Friendly Interface** - Intuitive frontend for accountants and staff

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Angular       │◄──►│   Flask API     │◄──►│   MongoDB       │
│   Frontend      │    │   Backend       │    │   Database      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │                 │
                       │   Excel Files   │
                       │   (Cashbook &   │
                       │ Personal Accts) │
                       │                 │
                       └─────────────────┘
```

### 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Angular | User interface and interactions |
| **Backend** | Flask (Python) | API endpoints and business logic |
| **Database** | MongoDB | Employee and institution data |
| **File Storage** | Excel (.xlsx) | Financial transaction records |
| **Protection** | Atomic Operations | File corruption prevention |

---

## 🚀 Quick Start

### 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Python](https://python.org/) (v3.8 or higher)
- [MongoDB](https://mongodb.com/) (running instance)

### 📥 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/loan-management-system.git
   cd loan-management-system
   ```

2. **Setup Backend (Flask)**
   ```bash
   # Navigate to backend folder
   cd backend
   
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # Windows (Git Bash/PowerShell):
   source venv/Scripts/activate
   # Linux/Mac:
   source venv/bin/activate
   
   # Install Python dependencies
   pip install -r requirements.txt
   ```

3. **Setup Frontend (Angular)**
   ```bash
   # Navigate to frontend folder (from root)
   cd ../frontend
   
   # Install Node modules
   npm install
   ```

4. **Environment Configuration**
   ```bash
   # Go back to root and create .env file
   cd ..
   cp .env.example .env
   # Edit .env with your MongoDB connection and file paths
   ```

### 🏃‍♂️ Running the Application

#### Start Frontend (Angular)
```bash
# From root folder
npm run 1
```
*Frontend will be available at `http://localhost:4200`*

#### Start Backend (Flask)
```bash
# Open a new terminal, navigate to root folder
npm run 2
```
*Backend API will be available at `http://localhost:5000`*

> **Note**: Make sure to activate your virtual environment in the backend folder before running the Flask application if you're running it manually.

---

## 📖 Usage Guide

### 💼 For Accountants

1. **Individual Payment Entry**
   - Navigate to the payment form
   - Select institution and employee
   - Enter capital/interest amounts
   - Submit to automatically update Excel files

2. **Batch Payment Processing**
   - Access the batch payment section
   - Upload employee list or select multiple employees
   - Enter payment details for the entire batch
   - Process all payments with one click

3. **Data Management**
   - View employee information from MongoDB
   - Track payment history
   - Generate reports and summaries

### 🔧 For Administrators

- **Employee Management**: Add, edit, or remove employee records
- **Institution Setup**: Configure multiple lending institutions
- **File Management**: Monitor Excel file integrity and backups
- **System Monitoring**: Track application performance and errors

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/loan_management

# Excel File Paths
CASHBOOK_FILEPATH=/path/to/cashbook.xlsx
PERSONAL_ACCOUNT_ROOTPATH=/path/to/personal_accounts/

# Application Settings
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
```

### Database Setup

```javascript
// MongoDB Collections Structure
{
  employees: {
    _id: ObjectId,
    name: String,
    accountNo: String,
    institution: String,
    // ... other fields
  }
}
```

---

## 🔒 Security Features

- **Atomic File Operations**: Prevents Excel file corruption during updates
- **Automatic Backups**: Creates safety backups before file modifications
- **Input Validation**: Comprehensive data validation on both frontend and backend
- **Error Handling**: Graceful error management with detailed logging
- **CORS Protection**: Configured Cross-Origin Resource Sharing

---

## 🧪 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/submitPayment` | Submit individual payment |
| `POST` | `/submitExcelBatchPayment` | Process batch payments |
| `POST` | `/update-cell` | Update specific Excel cell |
| `GET` | `/employees` | Retrieve employee list |
| `POST` | `/employees` | Add new employee |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 📝 Development Guidelines

- Follow Angular and Flask coding standards
- Write meaningful commit messages
- Include tests for new features
- Update documentation as needed

---

## 🐛 Troubleshooting

### Common Issues

**Frontend won't start:**
```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install
npm run 1
```

**Backend connection errors:**
```bash
# Check MongoDB is running
mongod --version
# Verify .env configuration
cat .env
```

**Excel file permissions:**
- Ensure the application has read/write access to Excel file paths
- Check that Excel files are not open in other applications

---

## 📊 Performance

- **File Processing**: Handles large Excel files efficiently
- **Batch Operations**: Processes hundreds of payments in seconds
- **Database Queries**: Optimized MongoDB operations
- **Memory Management**: Minimal memory footprint with automatic cleanup

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ for financial institutions
- Inspired by the need for efficient loan management
- Thanks to all contributors and testers

---

## 📞 Support

Having issues or questions? We're here to help!

- 📧 **Email**: support@loanmanagement.com
- 📖 **Documentation**: [Full Documentation](docs/)
- 🐛 **Bug Reports**: [GitHub Issues](issues/)
- 💬 **Discussions**: [GitHub Discussions](discussions/)

---

<div align="center">

**Made with 💻 and ☕ for better financial management**

⭐ **Star this repo if it helped you!** ⭐

</div>