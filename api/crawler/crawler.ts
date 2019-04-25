import { Application } from "express";
import request from 'request';
import * as cheerio from 'cheerio';
import { naverHeader } from "../../config/naver_header";
import mongoose from "mongoose";

export const crawler = 