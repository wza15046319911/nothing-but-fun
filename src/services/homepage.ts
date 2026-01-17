import request from './api';

export interface HomepageImage {
  id: string;
  sort: number | null;
  isVisible: boolean;
  imageUrl: string;
  dateCreated: string;
  dateUpdated: string;
}

export interface HomepageImagesResponse {
  success: boolean;
  data: HomepageImage[];
}

const homepageApi = {
  fetchHomepageImages: () => {
    return request({
      url: '/homepage-images',
      method: 'GET',
    }) as Promise<HomepageImagesResponse>;
  },
};

export default homepageApi;
