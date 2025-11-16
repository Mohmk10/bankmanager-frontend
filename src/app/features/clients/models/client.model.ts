export interface Client {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  isActive: boolean;
  nombreComptes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
}

export interface UpdateClientRequest {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
}
