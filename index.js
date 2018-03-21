const spider = require('./spider');
const target = 'http://www.mm131.com/xinggan/';

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
        let url = images[index].url;
        let item = await spider.getPage(url);
        let imageNum = spider.getImageNum(item.document, images[index].name);

        for (var i = 1; i <= imageNum; i++) {
            let url = images[index].url;
            if (i !== 1) {
                url = images[index].url.substr(0, images[index].url.length - 5) + `_${i}.html`
            }
            let page = await spider.getPage(url);
            await spider.downloadImage(page, i);
        }
        index++;
        downloadImages(images, index);
    } else {
        index++;
        downloadImages(images, index);
    }
};

main(target);