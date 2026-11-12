export interface User {
  id?: number;
  email: string;
  password?: string;
  nom: string;
  prenom: string;
  tel?: string;
  roles?: string[];
  idEntreprise?: number;
  idLabo?: number;
}

export interface JwtResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  nom: string;
  prenom: string;
  roles: string[];
  idEntreprise?: number;
  idLabo?: number;
}