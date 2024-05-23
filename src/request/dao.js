/*
 * @Author: 李永健
 * @Date: 2022-06-21 17:33:37
 * @LastEditors: 李永健
 * @LastEditTime: 2023-03-07 17:34:52
 * @Description: axios方法封装
 */

import axios from "axios";
import { compile } from "path-to-regexp";

const baseURL = "";

class LoadingService {
  options = {
    content: "",
  };
  instance = {};
  constructor() {}
  open(options) {
    Object.assign(this.options, options);
    const { content } = this.options;
    const id = `loading-${Math.random().toString(36).substr(2)}`;
    const wrap = document.createElement("div");
    wrap.id = id;

    const mask = document.createElement("div");
    {
      mask.style.position = "fixed";
      mask.style.zIndex = "2000";
      mask.style.top = "0";
      mask.style.bottom = "0";
      mask.style.left = "0";
      mask.style.right = "0";
      mask.style.backgroundColor = "rgba(0,0,0,0.6)";
      mask.style.transition = "opacity .3s";
    }
    const spinner = document.createElement("div");
    {
      spinner.style.position = "absolute";
      spinner.style.top = "50%";
      spinner.style.width = "100%";
      spinner.style.textAlign = "center";
      spinner.style.marginTop = "-21px";
    }
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    {
      svg.setAttribute("viewBox", "25 25 50 50");
      svg.style.height = "42px";
      svg.style.width = "42px";
      svg.style.animation = "loading-rotate 2s linear infinite";
    }
    var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    {
      circle.setAttribute("cx", "50");
      circle.setAttribute("cy", "50");
      circle.setAttribute("r", "20");
      circle.setAttribute("fill", "none");
      circle.style.animation = "loading-dash 1.5s ease-in-out infinite";
      circle.style.strokeDasharray = "90,150";
      circle.style.strokeDashoffset = "0";
      circle.style.strokeWidth = "2";
      circle.style.stroke = "#409eff";
      circle.style.strokeLinecap = "round";
    }
    var p = document.createElement("p");
    {
      p.innerHTML = content;
      p.style.color = "#409EFF";
      p.style.fontSize = "16px";
    }

    svg.appendChild(circle);
    spinner.appendChild(svg);
    if (content) {
      spinner.appendChild(p);
    }
    mask.appendChild(spinner);
    wrap.appendChild(mask);
    document.body.appendChild(wrap);
    this.instance[id] = wrap;
    return id;
  }
  close(id) {
    if (id) {
      document.body.removeChild(this.instance[id]);
      delete this.instance[id];
    } else {
      for (let x in this.instance) {
        document.body.removeChild(this.instance[x]);
        delete this.instance[x];
      }
    }
  }
}

class Dao {
  defaults = axios.defaults;
  interceptors = axios.interceptors;
  getUri = axios.getUri;
  request = axios.request;
  get = axios.get;
  delete = axios.delete;
  head = axios.head;
  options = axios.options;
  post = axios.post;
  put = axios.put;
  patch = axios.patch;
  constructor() {}
  create(createConfig) {
    const daos = {};
    Object.keys(createConfig).forEach((name) => {
      daos[name] = async (daoConfig = {}) => {
        const defaultOption = {
          data: {},
          baseURL: baseURL,
        };
        const config = Object.assign(defaultOption, createConfig[name], daoConfig);
        const Loading = new LoadingService();
        try {
          const { url, pathParams, loading, loadingContent = "请求中..." } = config;
          config.url = compile(url)(pathParams);
          if (loading) {
            Loading.open({
              content: loadingContent,
            });
          }
          const response = await axios(config);
          return response;
        } catch (error) {
          throw new Error(error);
        } finally {
          Loading.close();
        }
      };
    });
    return daos;
  }
}

const dao = new Dao();

export default dao;
