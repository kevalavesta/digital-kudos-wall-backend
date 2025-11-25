import { Entity } from "../../../shared/domain/entity";
import { UniqueEntityID } from "../../../shared/domain/unique-entity-id";
import { Result } from "../../../shared/core/result";
import { Email } from "./value-objects/email";
import { Password } from "./value-objects/password";

export interface UserProps {
  name: string;
  email: Email;
  password: Password;
  isEmailVerified: boolean;
}

export interface UserSnapshot extends UserProps {
  id: UniqueEntityID;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends Entity<UserProps> {
  private constructor(props: UserProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  get password(): Password {
    return this.props.password;
  }

  get isEmailVerified(): boolean {
    return this.props.isEmailVerified || false;
  }

  public static create(props: UserProps, id?: UniqueEntityID): Result<User> {
    const defaultProps: UserProps = {
      ...props,
      isEmailVerified: props.isEmailVerified || false,
    };

    return Result.ok(new User(defaultProps, id));
  }

  public static reconstitute(snapshot: UserSnapshot): Result<User, string> {
    const user = new User(
      {
        name: snapshot.name,
        email: snapshot.email,
        password: snapshot.password,
        isEmailVerified: snapshot.isEmailVerified,
      },
      snapshot.id,
    );

    return Result.ok<User>(user);
  }
}
