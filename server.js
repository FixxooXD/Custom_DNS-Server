import { createSocket } from 'dgram';
import dnsPacket from 'dns-packet';
const server = createSocket('udp4');

// Sample domain to IP mapping for different record types
const dnsRecords = {
    'example.com': {
        A: '127.0.0.1',           // IPv4 Address
        AAAA: '::1',              // IPv6 Address
        CNAME: 'alias.example.com' // Canonical Name
    },
    'alias.example.com': {
        A: '192.168.1.100'
    }
};

server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
});

server.on('listening', () => {
    const address = server.address();
    console.log(address);
    console.log(`server listening on ${address.address}:${address.port}`);
});

server.on('message', (msg, rinfo) => {
    const query = dnsPacket.decode(msg);
    console.log('DNS Query:', query);

        // Check if the client set the RECURSION_DESIRED flag
        const recursionDesired = query.flags & dnsPacket.RECURSION_DESIRED;
        console.log(recursionDesired);
        

      // Create a response packet
      const response = { 
        type: 'response',
        id: query.id,
        flags: dnsPacket.RECURSION_DESIRED | dnsPacket.RECURSION_AVAILABLE,

       
        
        questions: query.questions,
        answers: query.questions.map(question => ({
            name: question.name,
            type: question.type,
            class: question.class,
            ttl: 300,
            data: '127.0.0.2' // Hardcoded IP address
        }))
    };
    console.log(response);
    
    const encodedResponse = dnsPacket.encode(response);
    server.send(encodedResponse, rinfo.port, rinfo.address, () => {
        console.log(`Response sent to ${rinfo.address}:${rinfo.port}`);
    });
});


server.bind(53, '127.0.0.1');



