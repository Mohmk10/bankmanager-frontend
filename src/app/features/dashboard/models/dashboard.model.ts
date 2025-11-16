import { Compte } from "../../comptes/models/compte.model";
import { Transaction } from "../../transactions/models/transaction.model";

export interface DashboardData {
  totalComptes: number;
  soldeTotal: number;
  transactionsDuJour: number;
  comptesRecents: Compte[];
  transactionsRecentes: Transaction[];
}
