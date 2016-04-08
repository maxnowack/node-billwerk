import { isEmpty, extend } from 'lodash'
import { request } from './helpers'

export class BillwerkAPI {
  _getApiUrl(short = false) {
    return `https://${this.billwerkHost}${!short ? this.apiPath : ''}`
  }
  _checkAuth(force = false) {
    return new Promise((resolve, reject) => {
      if (!(isEmpty(this._authToken) || force)) resolve(this._authToken)
      request
        .post(`${this._getApiUrl(true)}/oauth/token`)
        .auth(this.clientId, this.clientSecret)
        .send({ grant_type: 'client_credentials' })
        .catch(reject)
        .then((response) => {
          if (response.status !== 200) return reject(response)
          this._authToken = response.data.access_token
          return resolve(this._authToken)
        })
    })
  }
  _call(action, method = 'GET', options = {}, skip, take = 500) {
    return new Promise((resolve, reject) => this._checkAuth()
      .catch(reject)
      .resolve((token) => {
        options.headers = extend(options.headers || {}, {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json; charset=utf-8',
        })
        let tmpQuery = options.query ? `${options.query}&` : '?'
        tmpQuery += skip ? `skip=${skip}&take=${take}` : `take=${take}`
        request[method.toLowerCase()](this._getApiUrl() + action + tmpQuery)
          .set(options.headers)
          .send(options.data)
          .catch(reject)
          .then((response) => {
            const data = response.body
            if (data && data.length >= take) {
              this._call(action, method, options, (skip || 0) + 500, take)
                .catch(reject)
                .then((newData) => resolve(data.concat(newData)))
            }
            return resolve(data)
          })
      })
    )
  }

  constructor(clientId, clientSecret, billwerkHost = 'sandbox.billwerk.com', apiPath = '/api/v1') {
    this._events = {}
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.billwerkHost = billwerkHost
    this.apiPath = apiPath
  }

  // /Orders
  createOrder(data) {
    return this._call('/Orders/', 'POST', { data })
  }
  changeOrder(data) {
    return this._call('/Orders/', 'POST', { data })
  }

  // /Orders/:OrderId/Commit
  commitOrder(orderId) {
    return this._call(`/Orders/${orderId}/commit`, 'POST', { data: {} })
  }

  // /Customers
  getCustomers() {
    return this._call('/Customers/', 'GET')
  }
  createCustomer(data) {
    return this._call('/Customers/', 'POST', { data })
  }

  // /Customers/:CustomerId
  getCustomer(customerId) {
    return this._call(`/Customers/${customerId}`, 'GET')
  }
  updateCustomer(customerId, data) {
    return this._call(`/Customers/${customerId}`, 'PUT', { data })
  }

  deleteCustomer(customerId) {
    return this._call(`/Customers/${customerId}`, 'DELETE')
  }

  // /Customers/:CustomerId/Contracts
  getCustomerContracts(customerId) {
    return this._call(`/Customers/${customerId}/Contracts`, 'GET')
  }

  // /Contracts
  getContracts() {
    return this._call('/Contracts', 'GET')
  }

  // /Contracts/:ContractId
  getContract(contractId) {
    return this._call(`/Contracts/${contractId}`, 'GET')
  }

  deleteContract(contractId) {
    return this._call(`/Contracts/${contractId}`, 'DELETE')
  }

  // /Contracts/:ContractId/Usage
  getContractUsage(contractId) {
    return this._call(`/Contracts/${contractId}/Usage`, 'GET')
  }
  addContractUsage(contractId, data) {
    return this._call(`/Contracts/${contractId}/Usage`, 'POST', { data })
  }

  // /Contracts/:ContractId/Usage/:UsageId
  deleteContractUsage(contractId, usageId) {
    return this._call(`/Contracts/${contractId}/Usage/${usageId}`, 'GET')
  }

  // /Contracts/:ContractId/ComponentSubscriptions/
  getContractSubscriptions(contractId) {
    return this._call(`/Contracts/${contractId}/ComponentSubscriptions`, 'GET')
  }
  createContractSubscription(contractId, data) {
    return this._call(`/Contracts/${contractId}/ComponentSubscriptions`, 'POST', { data })
  }

  // /Contracts/:ContractId/SelfServiceToken/
  getContractSelfServiceToken(contractId) {
    return this._call(`/Contracts/${contractId}/SelfServiceToken`, 'GET')
  }

  // /Invoices
  getInvoices(customerId) {
    return this._call('/Invoices', 'GET', customerId && { data: { customerId } })
  }

  // /Invoices/:InvoiceId
  getInvoice(invoiceId) {
    return this._call(`/Invoices/${invoiceId}`, 'GET')
  }

  // /Invoices/:InvoiceId/downloadLink
  getInvoiceDownloadLink(invoiceId) {
    return this._call(`/Invoices/${invoiceId}/downloadLink`, 'POST')
  }

  // /InvoiceDrafts
  getInvoiceDrafts() {
    return this._call('/InvoiceDrafts', 'GET')
  }

  // /InvoiceDrafts/:InvoiceDraftId
  getInvoiceDraft(invoiceDraftId) {
    return this._call(`/InvoiceDrafts/${invoiceDraftId}`, 'GET')
  }


  // /Files
  getFiles() {
    return this._call('/Files', 'GET')
  }

  // /Files/:FileId
  getFile(fileId) {
    return this._call(`/Files/${fileId}`, 'GET')
  }

  // /PlanGroups
  getPlanGroups() {
    return this._call('/PlanGroups', 'GET')
  }


  // /Plans
  getPlans() {
    return this._call('/Plans', 'GET')
  }

  // /PlanVariants
  getPlanVariants() {
    return this._call('/PlanVariants', 'GET')
  }

  deleteVariant(planVariantId) {
    return this._call(`/planVariants/${planVariantId}`, 'DELETE')
  }

  createPlanVariant(planId, data) {
    data.PlanId = planId
    return this._call(`/plans/${planId}/planVariants`, 'POST', { data })
  }

  // /webhooks/
  getWebhooks() {
    return this._call('/webhooks', 'GET')
  }

  createWebhook(data) {
    return this._call('/webhooks', 'POST', { data })
  }

  // /Webhooks/:WebhookId
  deleteWebhook(webhookId) {
    return this._call(`/webhooks/${webhookId}`, 'DELETE')
  }
}
