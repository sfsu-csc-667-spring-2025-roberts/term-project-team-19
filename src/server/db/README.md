# Database Setup and Testing

This guide will help you set up and test the PostgreSQL database for the project.

## Prerequisites

1. PostgreSQL installed on your system
2. Node.js and npm installed
3. Project dependencies installed (`npm install`)

## Environment Setup

1. Create a `.env` file in the project root with the following content:
```env
POSTGRES_USER=your_postgres_username
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=development
```

2. Replace `your_postgres_username` and `your_postgres_password` with your actual PostgreSQL credentials.

## Starting PostgreSQL Server

### On macOS (using Homebrew)

1. Install PostgreSQL (if not already installed):
```bash
brew install postgresql
```

2. Start the PostgreSQL service:
```bash
brew services start postgresql
```

3. Create the database:
```bash
createdb development
```

### On Linux

1. Install PostgreSQL:
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

2. Start the PostgreSQL service:
```bash
sudo service postgresql start
```

3. Create the database:
```bash
createdb development
```

## Testing the Database Connection

1. Run the test connection script:
```bash
npx tsx test-connection.ts
```

Expected output:
```
Connection has been established successfully.
```

## Initializing the Database Schema

1. Run the initialization script:
```bash
npx tsx init.ts
```

Expected output:
```
Database connection established successfully.
Starting schema sync...
Database schema synced successfully.
Database initialization completed successfully.
```

### Checking Database Status

1. List all databases:
```bash
psql -l
```

2. Connect to the database:
```bash
psql -U your_username -d development
```

3. List tables in the database:
```sql
\dt
```

## Commands

- Stop PostgreSQL: `brew services stop postgresql`
- Restart PostgreSQL: `brew services restart postgresql`
- Check PostgreSQL status: `brew services list | grep postgresql`
- Drop database: `dropdb development`
- Create database: `createdb development` 