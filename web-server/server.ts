import * as http from 'http';

interface UserProfile {
    name: string;
    role: string;
}

// Hardcoded allowed users database
const users: Record<string, UserProfile> = {
    "chimamanda": { name: "Chimamanda", role: "Admin" },
    "somkeme": { name: "Somkeme", role: "Developer" }
};

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    // FIX: Provide a fallback string and a dummy base URL so it never throws a syntax crash error
    const parsedUrl = new URL(req.url || '', 'http://localhost');
    
    const searchParams = parsedUrl.searchParams;       // Holds query data

    // BASE ROUTE: If they are on the home page or just hit /user without parameters
    if (!searchParams.has('name')) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(`
            <html>
                <body style="font-family: sans-serif; padding: 20px; text-align: center;">
                    <h1>Welcome to our Application!</h1>
                    <p>Kindly sign in to view your dashboard.</p>
                    <p>Try clicking one of these links to sign in:</p>
                    <a href="/user?name=Chimamanda">Sign in as Chimamanda</a> | 
                    <a href="/user?name=Somkeme">Sign in as Somkeme</a>
                </body>
            </html>
        `);
    }

    if (searchParams.has('name')) {
        // Extract the name parameter value and convert to lowercase to match our keys
        const requestedName = searchParams.get('name')?.toLowerCase() || '';
        const userData = users[requestedName];

        // If the user isn't Chimamanda or Somkeme
        if (!userData) {
            res.writeHead(403, { 'Content-Type': 'text/html' });
            return res.end(`
                <html>
                    <body style="font-family: sans-serif; padding: 20px; color: red;">
                        <h1>Access Denied</h1>
                        <p>Sorry, "${searchParams.get('name')}" is not registered in our system.</p>
                        <a href="/">Go Back Home</a>
                    </body>
                </html>
            `);
        }

        // If they are found, show their custom dashboard!
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(`
            <html>
                <body style="font-family: sans-serif; padding: 20px; background-color: #f4f4f9;">
                    <h1>Hello, ${userData.name}! </h1>
                    <p>Welcome back to your dashboard.</p>
                    <p>Your System Role: <strong>${userData.role}</strong></p>
                    <hr>
                    <a href="/">Log Out</a>
                </body>
            </html>
        `);
    }

    // FALLBACK 404: For any other completely broken paths (like /gallery or /settings)
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 Page Not Found</h1>');
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});