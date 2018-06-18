import Vue from 'vue'
import Vuex from 'vuex'

import router from '@/router'

import { key_jwt, key_user_data } from '@/common'

// imports of AJAX functions go here
import { fetchMatchesWithPredictions } from '@/api'
import { submitLogin } from '@/api'
import { submitLogout } from '@/api'
import { submitRegister } from '@/api'
import { submitResetPassword } from '@/api'
import { submitDeleteUser} from '@/api'
import { submitChangePassword } from '@/api'
import { isValidJwt } from '@/utils'

Vue.use(Vuex)

const state = {
    // The state object will serve as the single source of truth where all
    // the important application-level data is contained within the store.
    // This state object will contain data that can be accessed and watched for
    // changes by any components interested in them such as the Home component.
    matches: [],
    userData: {},
    jwt: '',
    // States of notification modal
    notificationHeader: '',
    notificationBody: '',
    notificationDisplay: false,
    notificationDisplayStyle: 'none'
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
                    // There is problem with authentication
                    // Back to login
                    if (error.response.status == 401) {
                        alert(error.response.data['message'])
                        this.$store.dispatch('logout').then(() => {
                            this.$router.push({ name: "Login" })
                        })
                    } else {
                        this.setNotificationContent({ header: 'Error',
                                                      body: error.response.data['message'] })
                        this.showNotification()
                    }
                } else if (error) {
                    context.commit('setNotificationContent', { header: 'Error',
                                                               body: error })
                    context.commit('showNotification')
                } else {
                    context.commit('setNotificationContent', { header: 'Error',
                                                               body: 'Error' })
                    context.commit('showNotification')
                }
            })
    },
    login(context, { username, password }) {
        return submitLogin(username, password)
            .then(response => {
                if (response.status === 200) {
                    context.commit('setJwtToken', { jwt: response.data['token'] })
                    context.commit('setUserData', { userData: response.data['user_data'] })
                    router.push({ name: "Home" })
                }
            })
            .catch(error => {
                if (error.response.data['message']) {
                    context.commit('setNotificationContent', { header: 'Error',
                                                               body: error.response.data['message'] })
                    context.commit('showNotification')
                } else if (error) {
                    context.commit('setNotificationContent', { header: 'Error',
                                                               body: 'Error Authenticating: ' + error })
                    context.commit('showNotification')
                } else {
                    context.commit('setNotificationContent', { header: 'Error',
                                                               body: 'Error' })
                    context.commit('showNotification')
                }
            })
    },
    logout(context) {
        return submitLogout()
            .then(() => {
                context.commit('setMatches', { matches: [] })
                context.commit('removeJwtToken')
                context.commit('removeUserData')
            })
            .catch(error => {
                alert(error)
            })
    },
    register(context, { jwt, username }) {
        return submitRegister(jwt, username)
            .then(response => {
                if (response.status === 201) {
                    context.commit('setNotificationContent', { header: 'Notification',
                                                               body: response.data['message'] + '<br/>' + 'Password: ' + response.data['user_data']['password'] })
                    context.commit('showNotification')
                }
            })
            .catch(error => {
                if (error.response.data['message']) {
                    // There is problem with authentication
                    // Back to login
                    if (error.response.status == 401) {
                        alert(error.response.data['message'])
                        this.$store.dispatch('logout').then(() => {
                            this.$router.push({ name: "Login" })
                        })
                    } else {
                        this.setNotificationContent({ header: 'Error',
                                                      body: error.response.data['message'] })
                        this.showNotification()
                    }
                } else if (error) {
                    context.commit('setNotificationContent', { header: 'Error',
                                                               body: error })
                    context.commit('showNotification')
                } else {
                    context.commit('setNotificationContent', { header: 'Error',
                                                               body: 'Error' })
                    context.commit('showNotification')
                }
            })
    },
    resetPassword(context, { jwt, username }) {
        return submitResetPassword(jwt, username)
            .then(response => {
                if (response.status === 201) {
                    context.commit('setNotificationContent', { header: 'Notification',
                                                               body: response.data['message'] + '<br/>' + 'Password: ' + response.data['user_data']['password'] })
                    context.commit('showNotification')
                }
            })
            .catch(error => {
                if (error.response.data['message']) {
                    // There is problem with authentication
                    // Back to login
                    if (error.response.status == 401) {
                        alert(error.response.data['message'])
                        this.$store.dispatch('logout').then(() => {
                            this.$router.push({ name: "Login" })
                        })
                    } else {
                        this.setNotificationContent({ header: 'Error',
                                                      body: error.response.data['message'] })
                        this.showNotification()
                    }
                } else if (error) {
                    context.commit('setNotificationContent', { header: 'Error',
                                                               body: error })
                    context.commit('showNotification')
                } else {
                    context.commit('setNotificationContent', { header: 'Error',
                                                               body: 'Error' })
                    context.commit('showNotification')
                }
            })
    },
    deleteUser(context, { jwt, username }) {
        return submitDeleteUser(jwt, username)
            .then(response => {
                if (response.status === 201) {
                    context.commit('setNotificationContent', { header: 'Notification',
                                                               body: response.data['message'] })
                    context.commit('showNotification')
                }
            })
            .catch(error => {
                if (error.response.data['message']) {
                    // There is problem with authentication
                    // Back to login
                    if (error.response.status == 401) {
                        alert(error.response.data['message'])
                        this.$store.dispatch('logout').then(() => {
                            this.$router.push({ name: "Login" })
                        })
                    } else {
                        this.setNotificationContent({ header: 'Error',
                                                      body: error.response.data['message'] })
                        this.showNotification()
                    }
                } else if (error) {
                    context.commit('setNotificationContent', { header: 'Error',
                                                               body: error })
                    context.commit('showNotification')
                } else {
                    context.commit('setNotificationContent', { header: 'Error',
                                                               body: 'Error' })
                    context.commit('showNotification')
                }
            })
    },
    changePassword(context, { jwt, old_password, new_password }) {
        return submitChangePassword(jwt, old_password, new_password )
            .then(response => {
                if (response.status === 201) {
                    context.commit('setNotificationContent', { header: 'Notification',
                                                               body: response.data['message'] })
                    context.commit('showNotification')
                } else {
                    context.commit('setNotificationContent', { header: 'Error',
                                                               body: response.data['message'] })
                    context.commit('showNotification')
                }
            })
            .catch(error => {
                if (error.response.data['message']) {
                    // There is problem with authentication
                    // Back to login
                    if (error.response.status == 401) {
                        alert(error.response.data['message'])
                        this.$store.dispatch('logout').then(() => {
                            this.$router.push({ name: "Login" })
                        })
                    } else {
                        this.setNotificationContent({ header: 'Error',
                                                      body: error.response.data['message'] })
                        this.showNotification()
                    }
                } else if (error) {
                    context.commit('setNotificationContent', { header: 'Error',
                                                               body: error })
                    context.commit('showNotification')
                } else {
                    context.commit('setNotificationContent', { header: 'Error',
                                                               body: 'Error' })
                    context.commit('showNotification')
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

            // Replace "-" by "/" to avoid issue on Safari
            let match_time = match.date.replace(/-/g, "/") + ' ' + match.time + ' ' + (match.timezone ? match.timezone : '')
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
            d = new Date(payload.userData['last_login_at'] * 1000 - d.getTimezoneOffset() * 60 * 1000)
            payload.userData['last_login_at'] = d.toLocaleString()
        }
        sessionStorage.setItem(key_user_data, JSON.stringify(payload.userData))
        state.userData = payload.userData
    },
    setJwtToken(state, payload) {
        console.log('setJwtToken payload = ', payload)
        sessionStorage.setItem(key_jwt, payload.jwt)
        state.jwt = payload.jwt
    },
    removeUserData(state) {
        sessionStorage.removeItem(key_user_data)
        state.userData = {}
    },
    removeJwtToken(state, payload) {
        sessionStorage.removeItem(key_jwt)
        state.jwt = ''
    },
    setNotificationContent(state, payload) {
        state.notificationHeader = payload['header']
        state.notificationBody = payload['body']
    },
    showNotification(state) {
        state.notificationDisplayStyle = 'block'
        state.notificationDisplay = true
    },
    hideNotification(state) {
        state.notificationDisplayStyle = 'none'
        state.notificationDisplay = false
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
            return isValidJwt(sessionStorage.getItem(key_jwt))
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
