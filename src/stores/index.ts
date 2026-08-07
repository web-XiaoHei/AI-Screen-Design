const stores = createPinia()
stores.use(
  createPersistedState({
    storage: sessionStorage,
  }),
)

export default stores
