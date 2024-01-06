import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractPrice } from "../utils";
export async function scrapeAmazonProduct(url:string){
    if(!url)return;

    const username=String(process.env.BRIGHT_DATA_USERNAME)
    const password=String(process.env.BRIGHT_DATA_PASSWORD)
    // curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_35a8c57a-zone-unblocker:nf3kj8gtt01h -k https://lumtest.com/myip.json
    const port=22225;
    const session_id=(1000000*Math.random())|0;
    const options={
        auth:{
            username:`${username}-session-${session_id}`,
            password,
        },
        host:"brd.superproxy.io",
        port,
        rejectUnauthorized:false
    }

    try {
        //Fetch prod page
        const response=await axios.get(url);
        // console.log(response.data);
        const $=cheerio.load(response.data);
        //extracting product details
        const title=$(`#productTitle`).text().trim();
        const currentPrice=extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('.a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
            $('#price')
        );
        const originalPrice=extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-price'),
            $("#listPrice")
        )

        const outOfStock=$("#availibility span").text().trim().toLowerCase()==='currently unavailable';
        const images = 
        $('#imgBlkFront').attr('data-a-dynamic-image') || 
        $('#landingImage').attr('data-a-dynamic-image') ||
        '{}'

        const imageUrls= Object.keys(JSON.parse(images));
        const currency=extractCurrency($('.a-price-symbol'));
        const discountRate=$('#savingsPercentage').text().replace(/[-%]/g, '').replace(/[()]/g, '');
        // console.log(originalPrice,outOfStock,currency,imageUrls,discountRate);
        // console.log(`${discountRate}`);
        //construct data object
            const data={
                url,
                currency:currency||'$',
                image:imageUrls[0],
                title,
                currentPrice:Number(currentPrice)|| Number(originalPrice),
                originalPrice:Number(originalPrice)||Number(currentPrice),
                priceHistory:[],
                discountRate:Number(discountRate),
                isOutOfStock:outOfStock,
                reviewsCount:100,
                stars:4.70,
                description:"",
                category:"",
                lowestPrice:Number(currentPrice)||Number(originalPrice),
                highestPrice:Number(originalPrice)||Number(currentPrice),
                averagePrice:Number(currentPrice)||Number(originalPrice)
            }
            console.log(imageUrls[0]);
            return data;
    } catch (error:any) {
        throw new Error(`Failed to scrape:${error.message}`)
    }

}