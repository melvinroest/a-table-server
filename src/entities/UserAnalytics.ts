import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class UserAnalytics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  source: string;

  @Column({type: 'real'})
  users: number;

  @Column({type: 'real'})
  new_users: number;

  @Column({type: 'real'})
  sessions: number;

  @Column({type: 'real'})
  bounce_rate: number;

  @Column()
  first_seen_on: Date;

  @Column({type: 'real'})
  pages_session: number;

  @Column({type: 'real'})
  avg_session_duration: number;

  @Column({type: 'real'})
  conversion_rate: number;

  @Column({type: 'real'})
  goal_value: number;
}