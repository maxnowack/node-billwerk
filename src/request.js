import superagentPromisePlugin from 'superagent-promise-plugin'
import superagent from 'superagent'

export default superagentPromisePlugin.patch(superagent)
