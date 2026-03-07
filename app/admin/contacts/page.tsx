// app/admin/contacts/page.tsx

import { createAdminClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { Contact } from '@/types'

export default async function AdminContactsPage() {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })

  const contacts = (data ?? []) as Contact[]

  return (
    <div className="p-10 max-w-4xl">
      <h1 className="font-display text-4xl font-light mb-10">Contacts</h1>

      {contacts.length === 0 ? (
        <p className="text-muted text-sm">No messages yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {contacts.map((contact) => (
            <div key={contact.id} className="py-5">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{contact.name}</p>
                  <p className="text-xs text-muted mt-0.5">
                    <a href={`mailto:${contact.email}`} className="hover:text-ink transition-colors">
                      {contact.email}
                    </a>
                    {' · '}
                    {formatDate(contact.created_at)}
                  </p>
                  <p className="text-sm text-ink mt-3 leading-relaxed whitespace-pre-wrap">
                    {contact.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
