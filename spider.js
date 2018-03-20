const rp = require("request-promise"), //request-promise模块
      fs = require("fs"), //fs模块
      cheerio = require("cheerio"), //进入cheerio模块 cheerio是一个node的库，可以理解为一个Node.js版本的jquery，用来从网页中以 css selector取数据，使用方式和jquery基本相同
      localPath = "images/"; //存放照片的地址

let folderPath; //图片本地文件夹地址

module.exports = {
    async getPage(url) { //根据url获取页面信息
        const page = {
            url: url,
            document: await rp({
                url: url
            })
        };
        return page;
    },
    getImages(page) { //根据页面信息，取得子链接放入数组
        let images = [];
        const $ = cheerio.load(page.document); //将html转换为可操作的节点
        $("#pins li a")
            .children()
            .each(async (i, e) => {
                let img = {
                    name: e.attribs.alt, //图片网页的名字，后面作为文件夹名字
                    url: e.parent.attribs.href //图片网页的url
                };
                images.push(img); //输出目录页查询出来的所有链接地址
            });
        return images;
    },
    makeDir(img) {
        folderPath = localPath + img.name;
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);//创建文件夹
            console.log(`${img.name}文件夹创建成功`);
            return true;
        } else {
            console.log(`${img.name}文件夹已经存在`);
            return false;
        }
    },
    getImageNum(page, name) {
        if (page) {
            let $ = cheerio.load(page);
            let len = $(".pagenavi")
            .find("a")
            .find("span").length;
            if (len == 0) {
                fs.rmdirSync(`${localPath}${name}`);//删除无法下载的文件夹
                return 0;
            }
            let pageIndex = $(".pagenavi")
            .find("a")
            .find("span")[len - 2].children[0].data;
            
            return pageIndex;//返回图片总数
        }
    },
    //下载相册照片
    async downloadImage(page, index) {
        if (page.document) {
            var $ = cheerio.load(page.document);
            if ($(".main-image").find("img")[0]) {
                let imgSrc = $(".main-image").find("img")[0].attribs.src;//图片地址
                let headers = {
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                    "Accept-Encoding": "gzip, deflate",
                    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                    "Cache-Control": "no-cache",
                    Host: "i.meizitu.net",
                    Pragma: "no-cache",
                    "Proxy-Connection": "keep-alive",
                    Referer: page.url,
                    "Upgrade-Insecure-Requests": 1,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.19 Safari/537.36"
                };//反防盗链
                await rp({
                    url: imgSrc,
                    resolveWithFullResponse: true,
                    headers
                }).pipe(fs.createWriteStream(`${folderPath}/${index}.jpg`));//下载
                console.log(`${folderPath}/${index}.jpg下载成功`);
            } else {
                console.log(`${folderPath}/${index}.jpg加载失败`);
            }
        }
    }
};