import superagentPromisePlugin from 'superagent-promise-plugin'
import superagent from 'superagent'

export const request = superagentPromisePlugin.patch(superagent)
