import { request } from './'

export default class BillwerkAPI {
  _getApiUrl(short = false) {
    return `https://${this.billwerkHost}${!short ? this.apiPath : ''}`
  }

  _checkAuth(force = false) {
    return new Promise((resolve, reject) => {
      if (this._authToken && !force) {
        resolve(this._authToken)
        return
      }
      request
        .post(`${this._getApiUrl(true)}/oauth/token`)
        .type('application/x-www-form-urlencoded')
        .auth(this.clientId, this.clientSecret)
        .send({ grant_type: 'client_credentials' })
        .then((response) => {
          if (response.status !== 200) return reject(response)
          this._authToken = response.body.access_token
          return resolve(this._authToken)
        }, error => console.log(error))
    })
  }

  _call(action, method = 'GET', options = {}, skip, take = 500, oldData = []) {
    return this._checkAuth()
      .then((token) => {
        options.headers = Object.assign({}, options.headers, {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json; charset=utf-8',
        })
        let tmpQuery = options.query ? `${options.query}&` : '?'
        tmpQuery += skip ? `skip=${skip}&take=${take}` : `take=${take}`
        return request[method.toLowerCase()](this._getApiUrl() + action + tmpQuery)
          .set(options.headers)
          .send(options.data)
          .then((response) => {
            const data = response.body
            if (!Array.isArray(data)) return data
            if (!data || !data.length) return oldData
            const idExists = !!oldData.filter(item => item.Id === data[0].Id).length
            if (idExists) return oldData
            if (data.length >= take) {
              return this._call(action, method, options, (skip || 0) + 500, take, oldData.concat(data))
            }
            return oldData.concat(data)
          })
      })
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

  // /Contracts/:ContractId/Usage
  getContractDiscountSubscriptions(contractId) {
    return this._call(`/Contracts/${contractId}/DiscountSubscriptions`, 'GET')
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

  getContractComponent(id) {
    return this._call(`/Components/${id}`, 'GET')
  }

  // /Contracts/:ContractId/SelfServiceToken/
  getContractSelfServiceToken(contractId) {
    return this._call(`/Contracts/${contractId}/SelfServiceToken`, 'GET')
  }

  // /Invoices
  getInvoices(customerId) {
    return this._call('/Invoices', 'GET', customerId ? { data: { customerId } } : {})
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

  // /Discounts
  getDiscounts() {
    return this._call('/Discounts', 'GET')
  }

  // /Discounts/
  getDiscountByID(id) {
    return this._call(`/Discounts/${id}`, 'GET')
  }

  // /Discounts
  getPaymentTransactions() {
    return this._call('/PaymentTransactions', 'GET')
  }

  getPaymentTransaction(id) {
    return this._call(`/PaymentTransactions/${id}`, 'GET')
  }
}
