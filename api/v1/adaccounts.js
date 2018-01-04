var express = require('express')
var AdAccount = require('../../models/account_ads')
var axios = require('axios')
var config = require('../../config')

const { versionGraphFacebook } = config

var router = express.Router()

router.get('/', (req, res) => {
  AdAccount.find({}, (error, adaccounts) => {
    if (error) res.status(500).json(error)
    else res.status(200).json(adaccounts)
  })
})

router.post('/', (req, res) => {
  axios.get(`${versionGraphFacebook}/me/businesses?access_token=${req.body.accessToken}`)
    .then(response => {
      req.body.created_time = new Date()
      let newAdAccount = new AdAccount(req.body)

      newAdAccount.save((error, adaccount) => {
        if (error) res.status(500).json(error)
        else res.status(200).json(adaccount)
      }, error => {
        if (error.response.status === 400)
          res.status(500).json(error.response.data)
      })
    }).catch(error => {
      if (error.response.status === 400)
        res.status(500).json(error.response.data)
    })
})

router.put('/:idAdAccount', (req, res) => {
  axios.get(`${versionGraphFacebook}/me/businesses?access_token=${req.body.accessToken}`)
    .then(response => {
      req.body.updated_time = new Date()
      AdAccount.findByIdAndUpdate(req.params.idAdAccount, req.body, (error, adaccount) => {
        if (error) res.status(500).json(error)
        else {
          adaccount.updated_time = req.body.updated_time
          res.status(200).json(adaccount)
        }
      })
    }, error => {
      if (error.response.status === 400)
        res.status(500).json(error.response.data)
    }).catch(error => {
      if (error.response.status === 400)
        res.status(500).json(error.response.data)
    })
})
/**
 * API trả về tất cả các tài khoản quảng cáo doanh nghiệp của tài khoản quảng cáo 
 */
router.get('/:idAdAccount/businesses', (req, res) => {
  AdAccount.findById(req.params.idAdAccount, (error, adaccount) => {
    if (error) throw error;

    if (!adaccount) {
      return res.status(404).json({ status: 404, errors: 'Object not found' });
    } else {
      axios.get(`${versionGraphFacebook}/me/businesses?access_token=${adaccount.accessToken}`)
        .then(response => {
          console.log('response.data.data', response.data.data)
          return res.status(200).json(response.data.data)
        }, error => {
          if (error.response.status === 400)
            res.status(500).json(error.response.data)
        }).catch(error => {
          if (error.response.status === 400)
            res.status(500).json(error.response.data)
        })
    }
  })
})

router.get('/:idAdAccount/adaccounts', (req, res) => {
  AdAccount.findById(req.params.idAdAccount, (error, adaccount) => {
    if (error) throw error;

    if (!adaccount) {
      return res.status(404).json({ status: 404, errors: 'Object not found' });
    } else {
      axios.get(`${versionGraphFacebook}/me/adaccounts?fields=id,name,created_time,funding_source,account_status,currency,spend_cap,amount_spent&access_token=${adaccount.accessToken}`)
        .then(response => {
          console.log('response.data.data', response.data.data)
          return res.status(200).json(response.data.data)
        }, error => {
          if (error.response.status === 400)
            res.status(500).json(error.response.data)
        }).catch(error => {
          if (error.response.status === 400)
            res.status(500).json(error.response.data)
        })
    }
  })
})

/**
 * API trả về tất cả các tài khoản quảng cáo của tài khoản doanh nghiệp
 */
router.get('/:idAdAccount/businesses/:idBusiness/adaccounts', (req, res) => {
  AdAccount.findById(req.params.idAdAccount, (error, adaccount) => {
    if (error) throw error;

    if (!adaccount) {
      return res.status(404).json({ status: 404, errors: 'Object not found' });
    } else {
      axios.get(`${versionGraphFacebook}/${req.params.idBusiness}/adaccounts?fields=id,name,created_time,funding_source,account_status,currency,spend_cap,amount_spent&access_token=${adaccount.accessToken}`)
        .then(response => {
          return res.status(200).json(response.data.data)

        }, error => {
          if (error.response.status === 400)
            res.status(500).json(error.response.data)
        }).catch(error => {
          if (error.response.status === 400)
            res.status(500).json(error.response.data)
        })
    }
  })
})

/**
 * API tất cả các chiến dịch quảng cáo của 1 tài khoản quảng cáo
 * idAdAccount là id mongo của tài khoản quảng cáo
 * idAct là id của 1 tài khoản quảng cáo facebook, có dạng act_xxxxx
 */
router.get('/:idAdAccount/:idAct/campaigns', (req, res) => {
  AdAccount.findById(req.params.idAdAccount, (error, adaccount) => {
    if (error) throw error;

    if (!adaccount) {
      return res.status(404).json({ status: 404, errors: 'Object not found' });
    } else {
      axios.get(`${versionGraphFacebook}/${req.params.idAct}/campaigns?fields=name,account_id,adlabels,status,created_time,start_time,stop_time,updated_time&access_token=${adaccount.accessToken}`)
        .then(response => {
          return res.status(200).json(response.data.data)

        }, error => {
          if (error.response.status === 400)
            res.status(500).json(error.response.data)
        }).catch(error => {
          if (error.response.status === 400)
            res.status(500).json(error.response.data)
        })
    }
  })
})

/**
 * API cập nhật/nâng ngưỡng chi tiêu cho 1 tài khoản quảng cáo 
 */
router.post('/:idAdAccount/:idAct/adspaymentcycle', (req, res) => {
  console.log('req.body.spend_cap', req.body.spend_cap)
  AdAccount.findById(req.params.idAdAccount, (error, adaccount) => {
    if (error) throw error;

    if (!adaccount) {
      return res.status(404).json({ status: 404, errors: 'Object not found' });
    } else {
      axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
      axios.post(`${versionGraphFacebook}/${req.params.idAct}?access_token=${adaccount.accessToken}`, {
        _reqName: 'adaccount',
        _reqSrc: 'AdsCMAccountSpendLimitDataLoader',
        include_headers: 'false',
        locale: 'vi_VN',
        method: 'post',
        pretty: '0',
        spend_cap: req.body.spend_cap,
        spend_cap_action: 'update',
        suppress_http_code: 1
      })
        .then(response => {
          return res.status(200).json(response.data)

        }, error => {
          if (error.response.status === 400)
            res.status(500).json(error.response.data)
        }).catch(error => {
          if (error.response.status === 400)
            res.status(500).json(error.response.data)
        })
    }
  })
})

/**
 * API đặt lại giới hạn chi tiêu
 */
router.put('/:idAdAccount/:idAct/adspaymentcycle/reset', (req, res) => {
  AdAccount.findById(req.params.idAdAccount, (error, adaccount) => {
    if (error) throw error;

    if (!adaccount) {
      return res.status(404).json({ status: 404, errors: 'Object not found' });
    } else {
      axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
      axios.post(`${versionGraphFacebook}/${req.params.idAct}?access_token=${adaccount.accessToken}`, {
        _reqName: 'adaccount',
        _reqSrc: 'AdsCMAccountSpendLimitDataLoader',
        include_headers: 'false',
        locale: 'vi_VN',
        method: 'post',
        pretty: '0',
        spend_cap_action: 'reset',
        suppress_http_code: 1
      })
        .then(response => {
          return res.status(200).json(response.data)

        }, error => {
          if (error.response.status === 400)
            res.status(500).json(error.response.data)
        }).catch(error => {
          if (error.response.status === 400)
            res.status(500).json(error.response.data)
        })
    }
  })
})

/**
 * API xóa giới hạn chi tiêu
 */
router.delete('/:idAdAccount/:idAct/adspaymentcycle', (req, res) => {
  AdAccount.findById(req.params.idAdAccount, (error, adaccount) => {
    if (error) throw error;

    if (!adaccount) {
      return res.status(404).json({ status: 404, errors: 'Object not found' });
    } else {
      axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
      axios.post(`${versionGraphFacebook}/${req.params.idAct}?access_token=${adaccount.accessToken}`, {
        _reqName: 'adaccount',
        _reqSrc: 'AdsCMAccountSpendLimitDataLoader',
        include_headers: 'false',
        locale: 'vi_VN',
        method: 'post',
        pretty: '0',
        spend_cap_action: 'delete',
        suppress_http_code: 1
      })
        .then(response => {
          return res.status(200).json(response.data)

        }, error => {
          if (error.response.status === 400)
            res.status(500).json(error.response.data)
        }).catch(error => {
          if (error.response.status === 400)
            res.status(500).json(error.response.data)
        })
    }
  })
})

/**
 * API cập nhật trạng thái của 1 chiến dịch 
 */
router.put('/:idAdAccount/:idCamp/status', (req, res) => {
  AdAccount.findById(req.params.idAdAccount, (error, adaccount) => {
    if (error) throw error;

    if (!adaccount) {
      return res.status(404).json({ status: 404, errors: 'Object not found' });
    } else {
      axios.post(`${versionGraphFacebook}/${req.params.idCamp}?access_token=${adaccount.accessToken}`, {
        status: req.body.status == 1 ? 'ACTIVE' : 'PAUSED'
      })
        .then(response => {
          return res.status(200).json(response.data)
        }, error => {
          if (error.response.status === 400)
            res.status(500).json(error.response.data)
        }).catch(error => {
          if (error.response.status === 400)
            res.status(500).json(error.response.data)
        })
    }
  })
})

/**
 * api trả về thông tin chi tiết của tài khoản quảng cáo https://graph.facebook.com/v2.10/act_101001306717768?access_token=EAAI4BG12pyIBADZAyg5mfW3J0pA3akpSOpx1OgpxQqOwtR4ZAwGwcZCNXWia3ZAZAXyU3qT7OcxZBFpnSQCnIiXVbbLv45TKUMIcJ0xvOh5rSqLsSZAoV1OGw3Y6drkHZC087WyAoY2MGC1ZB4RUFYOwyzCMmY3t7Oj9iVhKPSrJGXyul2aHflfo5wKOwVtoe3XWmm1YNRA0BjKPqfZAZCmi10m&_reqName=adaccount&_reqSrc=AdsCMAccountSettingsDataLoader&fields=%5B%22account_id%22%2C%22account_status%22%2C%22agencies%7Bid%2Cname%2Caccess_status%2Cpermitted_roles%2Cpicture%7D%22%2C%22agency_client_declaration%22%2C%22business_city%22%2C%22business_country_code%22%2C%22business%7Bid%2Cname%2Cprofile_picture_uri%7D%22%2C%22business_ad_account_requests%22%2C%22business_name%22%2C%22business_state%22%2C%22business_street%22%2C%22business_street2%22%2C%22business_zip%22%2C%22currency%22%2C%22dcaf%22%2C%22id%22%2C%22is_notifications_enabled%22%2C%22is_personal%22%2C%22is_update_timezone_currency_too_recently%22%2C%22name%22%2C%22owner%22%2C%22tax_id%22%2C%22tax_id_type%22%2C%22timezone_id%22%2C%22timezone_name%22%2C%22timezone_offset_hours_utc%22%2C%22users%22%2C%22user_role%22%2C%22is_oba_opt_out%22%5D&include_headers=false&locale=vi_VN&method=get&pretty=0&suppress_http_code=1
 * api trả về ngưỡng chi tiêu hiện tại https://graph.facebook.com/v2.10/act_101001306717768?access_token=EAAI4BG12pyIBADZAyg5mfW3J0pA3akpSOpx1OgpxQqOwtR4ZAwGwcZCNXWia3ZAZAXyU3qT7OcxZBFpnSQCnIiXVbbLv45TKUMIcJ0xvOh5rSqLsSZAoV1OGw3Y6drkHZC087WyAoY2MGC1ZB4RUFYOwyzCMmY3t7Oj9iVhKPSrJGXyul2aHflfo5wKOwVtoe3XWmm1YNRA0BjKPqfZAZCmi10m&_reqName=adaccount&_reqSrc=AdsCMAccountSpendLimitDataLoader&fields=%5B%22spend_cap%22%2C%22amount_spent%22%5D&include_headers=false&locale=vi_VN&method=get&pretty=0&suppress_http_code=1
 * https://graph.facebook.com/v2.10/act_101001306717768/adspaymentcycle?access_token=EAAAAUaZA8jlABAOpfBRCEIaF3cNRFEi7rAs1DGSZB6BXos1W0M6ajBGaZABe5KAtb7UUq2jlmuYAgzAVC8QzfqWna3fzSfRGnyKQEYGyez3NQuNgJYkcpCgCE9ZCHz9iplcHBDUKV7QCmp1fU0kVrETXeLGLVsVbNZBM4nsNZClfHAhi4W9z4M
 */

router.delete('/:idAdAccount', (req, res) => {
  AdAccount.findByIdAndRemove(req.params.idAdAccount, error => {
    if (error) res.status(500).json(error)
    else res.status(200).json({ success: true })
  })
})

module.exports = router