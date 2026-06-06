import { BookOpen, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react"
import type { CSSProperties, PointerEvent, ReactNode, TransitionEvent } from "react"
import type { DiscoverProfile } from "../types/linkit"
import { Pill } from "./AppShell"

type PublicProfileCardProps = {
  profile: DiscoverProfile
  topSlot?: ReactNode
  className?: string
  style?: CSSProperties
  onPointerDown?: (event: PointerEvent<HTMLElement>) => void
  onPointerMove?: (event: PointerEvent<HTMLElement>) => void
  onPointerUp?: (event: PointerEvent<HTMLElement>) => void
  onPointerCancel?: (event: PointerEvent<HTMLElement>) => void
  onTransitionEnd?: (event: TransitionEvent<HTMLElement>) => void
}

export function PublicProfileCard({
  profile,
  topSlot,
  className = "",
  style,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onTransitionEnd
}: PublicProfileCardProps) {
  return (
    <article
      className={`discover-card active-card public-profile-card ${className}`}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onTransitionEnd={onTransitionEnd}
    >
      <img className="profile-cover" src={profile.photos[0]} alt="" />
      <div className="discover-scrim" />
      {topSlot}
      <div className="photo-strip" aria-label="分享图片">
        {profile.photos.slice(1).map((photo) => (
          <img src={photo} alt="" key={photo} />
        ))}
      </div>
      <div className="profile-content">
        <Pill tone="green"><CheckCircle2 size={13} />{profile.verified}</Pill>
        <div className="discover-name">
          <h1>{profile.name}</h1>
          <span>{profile.gender} {profile.age}</span>
        </div>
        <p className="school-line"><BookOpen size={16} />{profile.school}</p>
        <p className="profile-post">{profile.post}</p>
        <div className="tag-row light">
          {profile.interests.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <div className="match-reason">
          <Sparkles size={17} />
          <div>
            <strong>推荐理由</strong>
            <p>{profile.reason}</p>
          </div>
        </div>
        <p className="discover-safety"><ShieldCheck size={15} />{profile.safety}</p>
      </div>
    </article>
  )
}
