export type ResponseGetShortSaleCampaignDetail= {
    campaignId: number;
    campaignName: string;
    startDate: string; // ISO date: "yyyy-MM-dd"
    endDate: string;   // ISO date
    status: string;
    imageUrl: string;
  }