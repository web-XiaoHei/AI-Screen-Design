export function useDataSource(dataId: Ref<string>) {
  const dataSource = inject<Ref<DataSourceSchema[]>>('dataSource')
  const source = computed(() => {
    return dataSource!.value.find((item) => item.id === dataId.value)
  })

  const data = computed(() => source.value?.data)

  return { data }
}
