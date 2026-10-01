import * as http from 'http';
import * as querystring from 'querystring';

interface Product {
    id: string;
    name: string;
    price: number;
    seller: string;
    ratings: number[];
}

const products: Record<string, Product> = {
    "101": { id: "101", name: "Vintage Leather Jacket", price: 120, seller: "Somkeme's Thrift", ratings: [5, 4] },
    "102": { id: "102", name: "Mechanical Keyboard", price: 85, seller: "TechBytes", ratings: [4] },
    "103": { id: "103", name: "Wireless Earbuds", price: 45, seller: "Amanda Gadgets", ratings: [] }
};

let nextProductId = 104;

const navHeader = `
    <nav style="background: #333; padding: 10px; margin-bottom: 20px; text-align: center; border-radius: 4px;">
        <a href="/" style="color: #fff; margin: 0 15px; text-decoration: none; font-weight: bold;">Browse Items</a> | 
        <a href="/add-product" style="color: #fff; margin: 0 15px; text-decoration: none; font-weight: bold;">Add New Product</a>
    </nav>
`;

const getAvgRating = (ratings: number[]): string => {
    if (ratings.length === 0) return "No ratings yet";
    const sum = ratings.reduce((a, b) => a + b, 0);
    return (sum / ratings.length).toFixed(1) + " Stars";
};

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    const parsedUrl = new URL(req.url || '', 'http://localhost');
    const pathname = parsedUrl.pathname.toLowerCase();
    const searchParams = parsedUrl.searchParams;

    if (pathname === '/' || pathname === '/browse') {
        let productCardsHtml = '';
        for (const id in products) {
            const prod = products[id];
            productCardsHtml += `
                <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 15px 0; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h3>${prod.name}</h3>
                    <p>Price: <strong>N${prod.price}</strong></p>
                    <p>Seller: <em>${prod.seller}</em></p>
                    <p>Rating: ${getAvgRating(prod.ratings)}</p>
                    <a href="/product/${prod.id}" style="background: #007bff; color: #fff; padding: 6px 12px; text-decoration: none; border-radius: 4px; display: inline-block;">View Product Details</a>
                </div>
            `;
        }

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(`
            <html>
                <head><meta charset="utf-8"></head>
                <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
                    ${navHeader}
                    <h1 style="text-align: center; color: #333;">Mini-Marketplace</h1>
                    <p style="text-align: center;">Welcome! Browse items, view details, or rate sellers.</p>
                    <hr>
                    ${productCardsHtml}
                </body>
            </html>
        `);
    }

    if (pathname === '/add-product' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(`
            <html>
                <head><meta charset="utf-8"></head>
                <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
                    ${navHeader}
                    <h1 style="color: #333;">Add a New Product</h1>
                    <p>Fill out the details below to publish your product immediately to the store database.</p>
                    <form action="/submit-product" method="POST" style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Product Name:</label>
                            <input type="text" name="name" required style="width: 100%; padding: 8px; box-sizing: border-box;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Price (in N):</label>
                            <input type="number" name="price" required min="1" style="width: 100%; padding: 8px; box-sizing: border-box;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Seller Store Name:</label>
                            <input type="text" name="seller" required style="width: 100%; padding: 8px; box-sizing: border-box;">
                        </div>
                        <button type="submit" style="background: #28a745; color: #fff; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; width: 100%;">Publish Listing</button>
                    </form>
                </body>
            </html>
        `);
    }

    if (pathname === '/submit-product' && req.method === 'POST') {
        let bodyChunks = '';

        req.on('data', (chunk) => {
            bodyChunks += chunk.toString();
        });

        req.on('end', () => {
            const formData = querystring.parse(bodyChunks);

            const name = formData.name as string;
            const priceNum = parseInt(formData.price as string, 10);
            const seller = formData.seller as string;

            if (!name || isNaN(priceNum) || !seller) {
                res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
                return res.end('<h1>Error</h1><p>Missing required product fields.</p><a href="/add-product">Try Again</a>');
            }

            const newId = nextProductId.toString();
            nextProductId++;

            products[newId] = {
                id: newId,
                name: name,
                price: priceNum,
                seller: seller,
                ratings: []
            };

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            return res.end(`
                <html>
                    <head><meta charset="utf-8"></head>
                    <body style="font-family: sans-serif; text-align: center; padding: 40px 20px;">
                        <h2 style="color: green;">Product Listed Successfully!</h2>
                        <p><strong>${name}</strong> has been assigned ID #${newId} and is live in the inventory.</p>
                        <br>
                        <a href="/" style="background: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Go to Home to View Listing</a>
                    </body>
                </html>
            `);
        });
        return;
    }

    if (pathname.startsWith('/product/')) {
        const pathSegments = pathname.split('/');
        const productId = pathSegments[2];
        const prod = products[productId];

        if (!prod) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            return res.end('<h1>404 Product Not Found</h1><a href="/">Back to Marketplace</a>');
        }

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(`
            <html>
                <head><meta charset="utf-8"></head>
                <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    ${navHeader}
                    <a href="/" style="text-decoration: none; color: #007bff;">← Back to Browsing</a>
                    <hr>
                    <h1 style="color: #222;">${prod.name}</h1>
                    <div style="background: #eef2f7; padding: 20px; border-radius: 8px;">
                        <p style="font-size: 1.2em;">Price: <strong>N${prod.price}</strong></p>
                        <p>Merchant Registered: <strong>${prod.seller}</strong></p>
                        <p>Current Score: <strong>${getAvgRating(prod.ratings)}</strong> (${prod.ratings.length} reviews)</p>
                    </div>

                    <h3 style="margin-top: 30px;">Leave a Quick Rating for this Seller:</h3>
                    <form action="/rate" method="GET" style="background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeeba;">
                        <input type="hidden" name="id" value="${prod.id}">
                        <label>Select Rating Score: </label>
                        <select name="score" style="padding: 5px;">
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                        <button type="submit" style="background: #ffc107; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px; font-weight: bold;">Submit Rating</button>
                    </form>
                </body>
            </html>
        `);
    }

    if (pathname === '/rate') {
        const productId = searchParams.get('id') || '';
        const scoreString = searchParams.get('score') || '';
        const scoreNum = parseInt(scoreString, 10);
        const prod = products[productId];

        if (!prod || isNaN(scoreNum) || scoreNum < 1 || scoreNum > 5) {
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            return res.end('<h1>Bad Request</h1><p>Invalid data submission.</p><a href="/">Back Home</a>');
        }

        prod.ratings.push(scoreNum);

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(`
            <html>
                <head><meta charset="utf-8"></head>
                <body style="font-family: sans-serif; text-align: center; padding: 40px 20px;">
                    <h2 style="color: green;">Rating Received Successfully!</h2>
                    <p>Your ${scoreNum}-star rating has been added to <strong>${prod.seller}</strong>.</p>
                    <br>
                    <a href="/product/${prod.id}" style="background: #28a745; color: #fff; padding: 8px 16px; text-decoration: none; border-radius: 4px;">Return to Product Page</a>
                </body>
            </html>
        `);
    }

    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 Path Not Found</h1><p>The marketplace route you looked for does not exist.</p><a href="/">Back to Home</a>');
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Marketplace server running at http://localhost:${PORT}`);
});
