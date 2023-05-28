import process from 'node:process'
import { createLibp2p } from 'libp2p'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { tcp } from '@libp2p/tcp'
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'
import { yamux } from '@chainsafe/libp2p-yamux'
import { multiaddr } from 'multiaddr'
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";

const client = async () => {
  const node = await createLibp2p({
    transports: [tcp()],
    connectionEncryption: [noise()],
    streamMuxers: [mplex(), yamux()],
    pubsub: gossipsub({ allowPublishToZeroPeers: true })
  })

  node.addEventListener('peer:connect', async (evt) => {
    console.log('Connection established to:', evt.detail.remotePeer.toString())	// Emitted when a new connection has been created
    console.log((await node.peerStore.all()).length);
  })

  node.addEventListener('peer:discovery', (evt) => {
    // No need to dial, autoDial is on
    console.log('Discovered:', evt.detail.id.toString())
  })

  if (process.argv.length >= 3) {
    const ma = multiaddr(process.argv[2])
    console.log(`pinging remote peer at ${process.argv[2]}`)
    const latency = await node.ping(ma)
    console.log(`pinged ${process.argv[2]} in ${latency}ms`)
  } else {
    console.log('no remote peer address given, skipping ping')
  }

  setInterval(async () => {
    const resp = await node.pubsub.publish('news', uint8ArrayFromString('Bird bird bird, bird is the word!')).catch(err => {
      console.error(err)
    })
    console.log(resp)
  }, 1000)

  // await node.stop()
}

export default client