// Employee Management Service

export interface Employee {
    id: string;
    name: string;
    phone: string;
    email?: string;
    password: string;
    role: 'employee';
    status: 'active' | 'inactive' | 'blocked' | 'deleted';
    profilePhoto?: string;
    assignedFarmers: string[]; // Farmer IDs
    commissionPoints: number;
    createdAt: string;
    createdBy: string; // Admin ID
    village?: string;
    address?: string;
}

export interface CommissionTransaction {
    id: string;
    employeeId: string;
    employeeName: string;
    type: 'add' | 'subtract' | 'adjust';
    points: number;
    reason: string;
    adminId: string;
    adminName: string;
    timestamp: string;
    balance: number; // Balance after transaction
}

const EMPLOYEES_KEY = 'ns_employees';
const COMMISSION_KEY = 'ns_commission_transactions';

export class EmployeeService {
    /**
     * Get all employees
     */
    static getAllEmployees(): Employee[] {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(EMPLOYEES_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Get employee by ID
     */
    static getEmployee(id: string): Employee | null {
        return this.getAllEmployees().find(e => e.id === id) || null;
    }

    /**
     * Get active employees only
     */
    static getActiveEmployees(): Employee[] {
        return this.getAllEmployees().filter(e => e.status === 'active');
    }

    /**
     * Create new employee
     */
    static createEmployee(
        name: string,
        phone: string,
        password: string,
        createdBy: string,
        email?: string,
        village?: string,
        address?: string
    ): Employee {
        const employee: Employee = {
            id: `emp_${Date.now()}`,
            name,
            phone,
            email,
            password, // Should be hashed in production
            role: 'employee',
            status: 'active',
            assignedFarmers: [],
            commissionPoints: 0,
            createdAt: new Date().toISOString(),
            createdBy,
            village,
            address
        };

        const all = this.getAllEmployees();
        all.push(employee);
        localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(all));

        return employee;
    }

    /**
     * Update employee
     */
    static updateEmployee(employee: Employee): boolean {
        const all = this.getAllEmployees();
        const index = all.findIndex(e => e.id === employee.id);

        if (index === -1) return false;

        all[index] = employee;
        localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(all));
        return true;
    }

    /**
     * Delete employee (soft delete)
     */
    static deleteEmployee(id: string): boolean {
        const employee = this.getEmployee(id);
        if (!employee) return false;

        employee.status = 'deleted';
        return this.updateEmployee(employee);
    }

    /**
     * Assign farmers to employee
     */
    static assignFarmers(employeeId: string, farmerIds: string[]): boolean {
        const employee = this.getEmployee(employeeId);
        if (!employee) return false;

        employee.assignedFarmers = [...new Set([...employee.assignedFarmers, ...farmerIds])];
        return this.updateEmployee(employee);
    }

    /**
     * Unassign farmer from employee
     */
    static unassignFarmer(employeeId: string, farmerId: string): boolean {
        const employee = this.getEmployee(employeeId);
        if (!employee) return false;

        employee.assignedFarmers = employee.assignedFarmers.filter(id => id !== farmerId);
        return this.updateEmployee(employee);
    }

    /**
     * Add commission points
     */
    static addCommission(
        employeeId: string,
        points: number,
        reason: string,
        adminId: string,
        adminName: string
    ): boolean {
        const employee = this.getEmployee(employeeId);
        if (!employee || points <= 0) return false;

        employee.commissionPoints += points;
        this.updateEmployee(employee);

        // Record transaction
        this.recordCommissionTransaction(
            employeeId,
            employee.name,
            'add',
            points,
            reason,
            adminId,
            adminName,
            employee.commissionPoints
        );

        return true;
    }

    /**
     * Subtract commission points
     */
    static subtractCommission(
        employeeId: string,
        points: number,
        reason: string,
        adminId: string,
        adminName: string
    ): boolean {
        const employee = this.getEmployee(employeeId);
        if (!employee || points <= 0) return false;

        employee.commissionPoints = Math.max(0, employee.commissionPoints - points);
        this.updateEmployee(employee);

        // Record transaction
        this.recordCommissionTransaction(
            employeeId,
            employee.name,
            'subtract',
            points,
            reason,
            adminId,
            adminName,
            employee.commissionPoints
        );

        return true;
    }

    /**
     * Record commission transaction
     */
    private static recordCommissionTransaction(
        employeeId: string,
        employeeName: string,
        type: 'add' | 'subtract' | 'adjust',
        points: number,
        reason: string,
        adminId: string,
        adminName: string,
        balance: number
    ) {
        const transaction: CommissionTransaction = {
            id: `comm_${Date.now()}`,
            employeeId,
            employeeName,
            type,
            points,
            reason,
            adminId,
            adminName,
            timestamp: new Date().toISOString(),
            balance
        };

        const all = this.getAllCommissionTransactions();
        all.unshift(transaction);
        localStorage.setItem(COMMISSION_KEY, JSON.stringify(all));
    }

    /**
     * Get all commission transactions
     */
    static getAllCommissionTransactions(): CommissionTransaction[] {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(COMMISSION_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Get commission transactions for employee
     */
    static getEmployeeCommissionHistory(employeeId: string): CommissionTransaction[] {
        return this.getAllCommissionTransactions().filter(t => t.employeeId === employeeId);
    }

    /**
     * Get statistics
     */
    static getStats() {
        const all = this.getAllEmployees();

        return {
            total: all.length,
            active: all.filter(e => e.status === 'active').length,
            inactive: all.filter(e => e.status === 'inactive').length,
            blocked: all.filter(e => e.status === 'blocked').length,
            deleted: all.filter(e => e.status === 'deleted').length,
            totalCommission: all.reduce((sum, e) => sum + e.commissionPoints, 0)
        };
    }

    /**
     * Search employees
     */
    static searchEmployees(query: string): Employee[] {
        const q = query.toLowerCase();
        return this.getAllEmployees().filter(e =>
            e.name.toLowerCase().includes(q) ||
            e.phone.includes(q) ||
            e.email?.toLowerCase().includes(q) ||
            e.village?.toLowerCase().includes(q)
        );
    }
}
