export interface CompanyLeaves {
  totalLeaves: number;
  casualLeaves: number;
  sickLeaves: number;
}

export interface Company {
  _id: string;
  companyID: string;
  name: string;
  companyType: string;
  employeeCount: number;
  status: string;
  CompanyLeaves: CompanyLeaves;
}
