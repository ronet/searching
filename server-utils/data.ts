import { Application } from "express";
import request from 'request';
import * as cheerio from 'cheerio';
import { WebClient } from "@slack/client";
import { naverHeader } from "../config/naver_header";
import mongoose from "mongoose";

const token = require("../config/slackbots.json").token;
const web = new WebClient(token);

export const data = (app: Application) => {
  const macbookHeader = naverHeader("맥북+프로+15");

  const content: {
    title: string;
    href: string;
    date: string;
  }[] = [];
  setInterval(async () => {
    //크롤링 후 content에 입력
    await request(
      {
        url: macbookHeader.referer,
        headers: macbookHeader
      },
      (error, response, body) => {
        if (!error && response.statusCode == 200) {
          const $ = cheerio.load(body);

          $("#articleList li").each((i, e) => {
            const year = new Date().getUTCFullYear(),
              month = new Date().getUTCMonth(),
              date = new Date().getUTCDate(),
              hour = $(e)
                .children(".aside")
                .children("a")
                .children(".info")
                .children(".time")
                .text()
                .split(":")[0],
              minute = $(e)
                .children(".aside")
                .children("a")
                .children(".info")
                .children(".time")
                .text()
                .split(":")[1],
              tempTitle = $(e)
                .children("a")
                .children(".item")
                .children(".tit")
                .children("h3")
                .text(),
              tempHref = `https://cafe.naver.com/${$(e)
                .children("a")
                .attr("href")}`,
              tempDate = `${year}-${month}-${date} ${hour}:${minute}:00`;

            content[i] = {
              title: tempTitle,
              href: tempHref,
              date: tempDate
            };
          });
        }
      }
    );

    const mongoData = mongoose.model('data');
    //content배열 element를 디비에서 검색, 없으면 저장 후 result에 저장
    const result = await Promise.all(content.map(async element => {
      const searchResult = await mongoData.findOne({ href: element.href });
      if (!searchResult) {
        await mongoData.create({
            title: element.title,
            href: element.href,
            date: element.date
        });
        return `${element.date} : ${element.title} ${element.href}`;
      }
      return '';
    })).then(res => res.join('\n'));
    //     for (const element of content) {
    //       const searchResult = await mongo.data.findOne({ href: element.href });
    //       if (!searchResult) {
    //         mongo
    //           .data({
    //             title: element.title,
    //             href: element.href,
    //             date: element.date
    //           })
    //           .save();
    //         result =
    //           `${element.date} : ${element.title}
    // ${element.href}
    // ` + result;
    //       }
    //     }

    //result가 있으면 전송
    if (result) {
      await web.chat.postMessage({
        channel: "DH2REQUCR",
        text: result,
        username: "맥북 올라와쪄염"
      });
    }
  }, 10000);
};
