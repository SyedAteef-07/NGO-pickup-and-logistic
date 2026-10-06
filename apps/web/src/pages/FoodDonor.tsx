import { ExternalLink, PackageOpen } from 'lucide-react'

export default function FoodDonor() {
  return <>
    <div className="page-heading"><div><span className="eyebrow">FOOD & DONOR MANAGEMENT</span><h1>Food & Donors</h1><p>Donor requests and food details belong to the shared Food & Donor module.</p></div></div>
    <section className="panel module-placeholder">
      <span className="module-placeholder-icon"><PackageOpen size={26}/></span>
      <h2>Admin food requests are not connected yet</h2>
      <p>The donor form is available as a local prototype. Its submissions stay in this browser; they do not create server records.</p>
      <a className="button button-secondary" href={`${import.meta.env.BASE_URL}donor/index.html`} target="_blank" rel="noreferrer">Open donor prototype <ExternalLink size={16}/></a>
    </section>
  </>
}
