import ApiService from "./ApiService";

const services = {
  apiService: new ApiService(process.env.NEXT_PUBLIC_BACKEND_URL),
};

export default services;
