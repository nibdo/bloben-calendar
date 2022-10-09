export interface CreateCardDavContactRequest {
  addressBookID: string;
  fullName: string;
  email: string;
}

export interface SearchCardDavContactResponse {
  id: string;
  email: string;
}

export interface GetCardDavContactsResponse {
  id: string;
  fullName: string;
  emails: string[];
}
