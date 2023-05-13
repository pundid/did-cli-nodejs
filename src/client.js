import process from 'node:process'
import { createLibp2p } from 'libp2p'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { tcp } from '@libp2p/tcp'
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'
import { multiaddr } from 'multiaddr'
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";

const client = async () => {
  const node = await createLibp2p({
    transports: [tcp()],
    connectionEncryption: [noise()],
    streamMuxers: [mplex()],
    pubsub: gossipsub({ allowPublishToZeroPeers: true })
  })

  if (process.argv.length >= 3) {
    const ma = multiaddr(process.argv[2])
    console.log(`pinging remote peer at ${process.argv[2]}`)
    const latency = await node.ping(ma)
    console.log(`pinged ${process.argv[2]} in ${latency}ms`)
    const resp = await node.pubsub.publish('news', uint8ArrayFromString('banana'))
    console.log(resp);
  } else {
    console.log('no remote peer address given, skipping ping')
  }

  await node.stop()
}

export default client