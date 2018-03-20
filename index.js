const spider = require('./spider');
const target = 'http://www.mzitu.com/';

let start = 1;
let end = 10;

const main = async url => {
    let images = [];
    let index = 0;

    const page = await spider.getPage(url);
    images = spider.getImages(page);
    downloadImages(images, index);
};

const downloadImages = async (images, index) => {
    if (index == images.length) {
        start++;
        if (start < end) {
            main(target + start);
        }
        return false;
    }
    if (spider.makeDir(images[index])) {
        let item = await spider.getPage(images[index].url);
        let imageNum = spider.getImageNum(item.document, images[index].name);

        for (var i = 1; i <= imageNum; i++) {
            let page = await spider.getPage(images[index].url + `/${i}`);
            await spider.downloadImage(page, i);
        }
        index++;
        downloadImages(images, index);
    } else{
        index++;
        downloadImages(images, index);
    }
};

main(target + start);