import axios, { AxiosInstance } from "axios";

class HttpService {
  readonly instance: AxiosInstance;

  constructor(baseUrl) {
    this.instance = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
    });
  }
}

export default HttpService;
