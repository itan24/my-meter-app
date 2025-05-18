export interface ProfileResponse {
    id: number;
    userId: string;
    tenantName: string;
    meterNumber: string;
    lastConsumption: number | null;
    lastReadingDate: string | null;
    initialReading: number | null;
  }
  
  export interface ReadingResponse {
    id: number;
    profileId: number;
    date: string;
    previous: number;
    current: number;
    consumption: number;
  }
  
  export interface ProfileCreate {
    tenantName: string;
    meterNumber: string;
  }
  
  export interface ReadingCreate {
    profileId: number;
    date: string;
    previous: number;
    current: number;
  }