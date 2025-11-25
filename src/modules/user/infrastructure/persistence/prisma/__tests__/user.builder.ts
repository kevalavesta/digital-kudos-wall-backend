import { User, UserProps } from "../../../../domain/user.entity";
import { Email } from "../../../../domain/value-objects/email";
import { Password } from "../../../../domain/value-objects/password";
import { UniqueEntityID } from "../../../../../../shared/domain/unique-entity-id";
import { Result } from "../../../../../../shared/core/result";

export class UserBuilder {
  private props: Partial<UserProps> = {};
  private id?: UniqueEntityID;

  withName(name: string): this {
    this.props.name = name;
    return this;
  }

  withEmail(email: string): this {
    this.props.email = Email.create(email).getValue();
    return this;
  }

  withPassword(password: string): this {
    this.props.password = Password.create(password).getValue();
    return this;
  }

  withIsEmailVerified(isVerified: boolean): this {
    this.props.isEmailVerified = isVerified;
    return this;
  }

  withId(id: UniqueEntityID): this {
    this.id = id;
    return this;
  }

  build(): User {
    const emailResult = this.props.email
      ? Result.ok(this.props.email)
      : Email.create("default.user@example.com");
    const passwordResult = this.props.password
      ? Result.ok(this.props.password)
      : Password.create("ValidPassword123!");

    if (emailResult.isFailure)
      throw new Error("Invalid default email in UserBuilder");
    if (passwordResult.isFailure)
      throw new Error("Invalid default password in UserBuilder");

    const defaultProps: UserProps = {
      name: this.props.name || "Default User",
      email: emailResult.getValue(),
      password: passwordResult.getValue(),
      isEmailVerified:
        this.props.isEmailVerified === undefined
          ? false
          : this.props.isEmailVerified,
    };

    const userResult = User.create(defaultProps, this.id);
    if (userResult.isFailure) throw new Error(userResult.error());

    return userResult.getValue();
  }
}
