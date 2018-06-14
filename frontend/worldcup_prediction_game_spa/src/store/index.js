import Vue from 'vue'
import Vuex from 'vuex'

// imports of AJAX functions go here
import { fetchMatchesWithPredictions } from '@/api'
import { submitLogin } from '@/api'
import { submitLogout } from '@/api'
import { submitRegister } from '@/api'
import { isValidJwt, EventBus } from '@/utils'

Vue.use(Vuex)

const state = {
    // The state object will serve as the single source of truth where all
    // the important application-level data is contained within the store.
    // This state object will contain data that can be accessed and watched for
    // changes by any components interested in them such as the Home component.
    matches: [],
    userData: {},
    jwt: ''
}

const actions = {
    // The actions object is where I will define what are known as action methods.
    // Action methods are referred to as being "dispatched" and they're used to
    // handle asynchronous operations such as AJAX calls to an external service or API.
    loadMatchesWithPredictions(context, { jwt }) {
        return fetchMatchesWithPredictions(jwt)
            .then((response) => {
                if (response.status === 200) {
                    context.commit('setMatches', { matches: response.data })
                }
            })
            .catch(error => {
                if (error.response.data['message']) {
                    // TODO: Use HTML dialog
                    alert(error.response.data['message'])
                } else if (error) {
                    alert(error)
                } else {
                    alert('Error')
                }
            })
    },
    login(context, { username, password }) {
        return submitLogin(username, password)
            .then(response => {
                if (response.status === 200) {
                    context.commit('setJwtToken', { jwt: response.data['token'] })
                    context.commit('setUserData', { userData: response.data['user_data'] })
                }
            })
            .catch(error => {
                if (error.response.data['message']) {
                    // TODO: Use HTML dialog
                    alert(error.response.data['message'])
                } else if (error) {
                    alert('Error Authenticating: ', error)
                } else {
                    alert('Error')
                }
            })
    },
    logout(context) {
        return submitLogout()
            .then(response => {
                context.commit('setMatches', { matches: [] })
                context.commit('setJwtToken', { jwt: '' })
                context.commit('setUserData', { userData: {} })
            })
            .catch(error => {
                alert(error)
            })
    },
    register(context, { jwt, username }) {
        return submitRegister(jwt, username)
            .then(response => {
                if (response.status === 201) {
                    // TODO: Use HTML dialog
                    alert(response.data['message'])
                    alert(response.data['user_data'])
                }
            })
            .catch(error => {
                if (error.response.data['message']) {
                    // TODO: Use HTML dialog
                    alert(error.response.data['message'])
                } else if (error) {
                    alert(error)
                } else {
                    alert('Error')
                }
            })
    }
}

const mutations = {
    // The mutations object provides methods which are referred to being "committed"
    // and serve as the one and only way to change the state of the data in the state object.
    // When a mutation is committed any components that are referencing
    // the now reactive data in the state object are updated with the new values, causing the UI to update and re-render its elements.
    setMatches(state, payload) {
        for (let i = 0; i < payload.matches.length; i++) {
            let match = payload.matches[i]
            if (match['knockout']) {
                match['group'] = 'Knockout'
            }

            let match_time = match.date + ' ' + match.time + ' ' + (match.timezone ? match.timezone : '')
            let d = new Date(match_time)
            match['local_match_time'] = d.toLocaleString()
        }
        state.matches = payload.matches
    },
    setUserData(state, payload) {
        console.log('setUserData payload = ', payload)
        if (payload.userData['last_login_at']) {
            // Backend returns timestamp in second (UTC)
            let d = new Date()
            // FIXME: Should force backend return timestamp of UTC+0?
            d = new Date(payload.userData['last_login_at'] * 1000 - d.getTimezoneOffset() * 60 * 1000)
            payload.userData['last_login_at'] = d.toLocaleString()
        }
        localStorage.setItem('user_data', JSON.stringify(payload.userData))
        state.userData = payload.userData
    },
    setJwtToken(state, payload) {
        console.log('setJwtToken payload = ', payload)
        localStorage.setItem('jwt', payload.jwt)
        state.jwt = payload.jwt
    }
}

const getters = {
    // The getters object contains methods also, but in this case they serve to
    // access the state data utilizing some logic to return information.
    // Getters are useful for reducing code duplication and promote reusability across many components.
    isAuthenticated(state) {
        if (state.jwt) {
            return isValidJwt(state.jwt)
        } else {
            return isValidJwt(localStorage.getItem('jwt'))
        }
    }
}

const store = new Vuex.Store({
    state,
    actions,
    mutations,
    getters
})

export default store