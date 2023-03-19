'use strict';

import { pinyin } from 'pinyin-pro';


// chrome 扩展开发

function nGramTokenizer(words: any, n: any) {
    // 如果字符串长度小于 n，则返回整个字符串作为一个词语
    if (words.length < n) {
        return [words];
    }

    const tokens = [];

    // 按照 n 元分词算法对字符串进行分词
    for (let i = 0; i <= words.length - n; i++) {
        tokens.push(words.slice(i, i + n).join(''));
    }

    return tokens;
}

function getAllNGrams(str: any) {
    const ngrams = [];
    const maxN = Math.min(str.length, 5);

    // 遍历字符串中的所有可能的 n 元组合
    for (let n = 1; n <= maxN; n++) {
        const tokens = nGramTokenizer(str, n);
        ngrams.push(...tokens);
    }

    return ngrams;
}



function split(text: any) {
    const words = pinyin(
        text, { toneType: 'none', type: 'string', nonZh: 'consecutive' }).
        split(' ').
        filter(word => word);
    const tokens = getAllNGrams(words);
    // console.log(words);
    console.log(tokens);
    return tokens;
}

const SearchEngine = {
    lastId: 0,
    id2page: new Map(),
    url2id: new Map(),

    // word to pages
    index: new Map(),

    insert(url: any, title: any) {
        // console.log(pinyin('汉语拼音', { toneType: 'none', type: 'array' }));
        // console.log(pinyin('汉语拼音 张', { pattern: 'initial', type: 'array' }));
        // console.log(pinyin(title, { toneType: 'none', type: 'array', nonZh: 'consecutive' }));
        split(title);

        let id = this.url2id.get(url);
        if (id) {
            return id;
        }

        id = ++this.lastId;
        this.id2page.set(id, {
            'url': url,
            'title': title,
        });

        const tokens = split(title);
        tokens.forEach(t => {
            if(!this.index.has(t)) {
                this.index.set(t, new Set());
            }
            const s = this.index.get(t);
            s.add(id);
        })


        this.url2id.set(url, id);
        console.log(this);
        return id;
    },
    get(id: any) {
        return this.id2page.get(id);
    },

    // query with text
    query(q: any) {
        const id_set = this.index.get(q);
        if(!id_set) {
            return
        }

        const pages: any = [];
        id_set.forEach((id: any) => {
            const page = this.id2page.get(id);
            if(page) {
                pages.push(page);
            }
        })
        return pages;
    },
};

export default SearchEngine;