function FilterPills({ options, active, onChange, scrollable = false }) {
  return (
    <div className={`filter-pills${scrollable ? ' filter-pills--scroll' : ''}`}>
      <button
        className={`filter-pill${active === null ? ' active' : ''}`}
        onClick={() => onChange(null)}
      >
        All
      </button>
      {options.map(opt => (
        <button
          key={opt}
          className={`filter-pill${active === opt ? ' active' : ''}`}
          onClick={() => onChange(active === opt ? null : opt)}
        >
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </button>
      ))}
    </div>
  )
}

export default FilterPills
