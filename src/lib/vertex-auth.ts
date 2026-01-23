import { GoogleAuth } from 'google-auth-library';

const credentials = {
    type: "service_account",
    project_id: "gen-lang-client-0677425439",
    private_key_id: "9d4d882dbcc962042a670361531d07ffea48b239",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCzTIN7NNeaO5oB\nXnxIpQlg36jmxcCJ7B6e0Cjc5GaemLg9l2+ZBkC5PesRSYZ0HjxahcgoKFl/0Nxv\nsU8rwUwwWgk+IYokS3nJSiZh3P0NMy5fQ7MOBCqKqPqwksR5h44RlKKD4Ecq9hD/\nW6VICOgbycRFgjv+faMiPrbogGCXmyYux4wXYUZKiu6XcDUlFhVajh4jP5XVQriW\nPFakNf/N4GfF8GyM8UIsW2AHMtIC5wLwLLVTkwnFYh1E28oy7fHyld5hnNLjBq5X\nQ3pDb6xFx6BxbVfiFZvA3DoECOqxcA7xbp6VV7cLH/sgKLu6vt00mBH94lT6Hfl9\nPCAO+SuJAgMBAAECggEABke2TUD3EkxnIwgjs0mwj+eVm2uuyEXwdqCU5dPMMl7o\nCSQ+QO5iovpjuunH31ZVx9fqwFlVdTAkIHdl7gLpv8HPlBEJrSbFn8LMoF3ksSsr\nQyP0aBfGQ7ASg8/IOPeCBuSdYqAe7gbLZp5XpjPFqX+CM+sRXeMZrS/kKTWh7H1w\nLOFtoWRIj0QB2zfGf7EI7hJtDCKsQW7skDxRPt5FB2ZOxwfZU3x1ZrZwWcv3Pm+7\nK/bmnUMpLjmFK1N4aw7BEOinyKEKUZ3NeGROk17pQPjuiuL9bBpjDuMk9YtN2w9m\nrXmFgy3fgNezCvNdRskpCXUrUQXNzHsoTK8Hk1lYlwKBgQDgvHNUmr5X9BcKpSmb\nE2L3jMdq/c7Me6Z8wusojZAol+y2UCJpyfv4Lxb9OTqWHQIDapfFiPW710hiK8aV\nrYncLo8KryrYSD0xixpvtjVwUlHNzKhqHHy8dJIUwrPn7Z29DAd/M86F8DjqxZuq\nIW9RZuUxxXeqdI2p4jatv4mprwKBgQDMPebeHyJoHWbF3a9oqxhdhutu4zo1WQha\n7CToXb3in3hw6Bnq+Eo52u+fKvG0k4m0cgBhP1kPGZJo+pDbPn/I2k51bcRYGUu8\ndIdICVqBjdeupGAT9T0SO7S48h8oFZg+83z7gQ3FksRIGSdHcpBOAcG7yXA01Wsy\ny3Ds4xmkRwKBgHtsA4q7UT3Md7sI6ciY5Qk+72X67c+vOMfb5HnpBPrGNOILMFsY\n6qBqfB2liF9YnvpxV9jMVuhKWx5PHEinfcbGaxhbCxSs166Vznb7gm2lR/fWJcfg\nzUBSZMeyBkuhW7evG47oTMuSGjAVRmAw7ImwEL88y3N5fzOFYLIbNudRAoGBAJkT\ngBhUn3YHK0L7fv9k1NMsTwKCHdtkCmYS/SqHL81NlniRDPPV+dPY6qWSCyw7NAdh\nNjWsw/QUR26U9cLM2ftQ22MZzQH2m5P4hngQQpw9Ej0bh8MNmCM1SqMfHQju/neY\nCMF7nTXKZYBgEddz3wIIQQqc1JNUrY6Zed6h61L7AoGAXr9CXowMUqAtMMNp2u0z\nmvtPa8vJxeCCyFnkqfnJ9c9fCu7sIp0T+ihcrkevdaTYMS51dOmsUbAm3r50eoZA\n66alws+tVqBIMJK3OaCIIImzVw4LSeJlqzqjZxa//f9+kvLfmRJYJZXwPEFZl1T6\nl2m3L+s5fVSz8/W1+9rPBEo=\n-----END PRIVATE KEY-----\n",
    client_email: "mywallet-vertex-ai@gen-lang-client-0677425439.iam.gserviceaccount.com",
    client_id: "103968398092263843884",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/mywallet-vertex-ai%40gen-lang-client-0677425439.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
};

export async function getVertexAIToken() {
    const auth = new GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();

    return token.token;
}

export const VERTEX_CONFIG = {
    project: 'gen-lang-client-0677425439',
    location: 'us-central1',
    model: 'gemini-1.5-flash',
};
