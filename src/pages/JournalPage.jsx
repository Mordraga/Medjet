import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import EntryList from '../EntryList'
import DeityList from '../DeityList'
import SpellList from '../SpellList'
import DivinationList from '../DivinationList'
import OfferingList from '../OfferingList'

const SECTIONS = [
  { id: 'journal',    label: 'Log'        },
  { id: 'deities',    label: 'Deities'    },
  { id: 'spells',     label: 'Spells'     },
  { id: 'divination', label: 'Divination' },
  { id: 'offerings',  label: 'Offerings'  },
]

function JournalPage() {
  const location = useLocation()
  const [section, setSection] = useState(location.state?.section ?? 'journal')

  return (
    <div className="page">
      <div className="journal-section-tabs">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            className={`journal-section-tab${section === s.id ? ' active' : ''}`}
            onClick={() => setSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === 'journal'    && <EntryList />}
      {section === 'deities'    && <DeityList />}
      {section === 'spells'     && <SpellList />}
      {section === 'divination' && <DivinationList />}
      {section === 'offerings'  && <OfferingList />}
    </div>
  )
}

export default JournalPage
