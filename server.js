import { createSocket } from 'dgram';
import dnsPacket from 'dns-packet';
const server = createSocket('udp4');

server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
});

server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

server.on('message', (msg, rinfo) => {
    const query = dnsPacket.decode(msg);
    console.log('DNS Query:', query);

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

    const encodedResponse = dnsPacket.encode(response);
    server.send(encodedResponse, rinfo.port, rinfo.address, () => {
        console.log(`Response sent to ${rinfo.address}:${rinfo.port}`);
    });
});


server.bind(53, '127.0.0.1');



